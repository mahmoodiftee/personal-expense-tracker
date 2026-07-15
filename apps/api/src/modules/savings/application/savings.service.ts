import { Inject, Injectable } from '@nestjs/common';
import {
  CurrencyCode,
  Flow,
  type FixedExpense,
  type IncomeSource,
  type Money,
  type MonthKey,
  type MonthlySavings,
  type SavingsHistory,
  type SavingsProjection,
  type SavingsProjectionPoint,
} from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import { resolveCurrencyFromMonies } from '../../../common/domain/currency.util';
import {
  effectiveAmountForMonth,
  isActiveInMonth,
} from '../../../common/domain/recurring.calculations';
import { round2 } from '../../../common/util/math.util';
import { currentMonthKey, monthKeyRange, shiftMonthKey } from '../../../common/util/month.util';
import { validateMonthRange } from '../../../common/validation/validate-month-range';
import { FixedExpenseService } from '../../fixed-expenses/application/fixed-expense.service';
import { IncomeService } from '../../income/application/income.service';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../transactions/domain/transaction.repository.port';
import { forecastSavings } from '../domain/forecast.engine';
import type {
  MonthlySavingsQueryDto,
  SavingsHistoryQueryDto,
  SavingsProjectionQueryDto,
} from './dto/savings-query.dto';

/** Guards runaway history/aggregation windows. */
const MAX_HISTORY_MONTHS = 60;

/**
 * Savings use cases. Savings is derived, so this service *composes* the income,
 * fixed-expense, and transaction (variable-expense) reads rather than owning a
 * collection — a clean application-layer aggregation (SRP, DRY, DIP).
 *
 * Definition: `savings = expected income − (fixed due + variable actual)`.
 */
@Injectable()
export class SavingsService {
  constructor(
    private readonly income: IncomeService,
    private readonly fixedExpenses: FixedExpenseService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(SavingsService.name);
  }

  getMonthly(userId: string, query: MonthlySavingsQueryDto): Promise<MonthlySavings> {
    return this.computeMonthlySavings(userId, query.month);
  }

  /** Savings for each month in an inclusive range, with aggregates. */
  async getHistory(userId: string, query: SavingsHistoryQueryDto): Promise<SavingsHistory> {
    const months = validateMonthRange(query.from, query.to, MAX_HISTORY_MONTHS);
    const monthly = await this.computeMonthlySavingsBatch(userId, months);
    const currency = this.resolveSeriesCurrency(monthly);

    const totalSavedMinor = monthly.reduce((sum, m) => sum + m.savings.amountMinor, 0);
    const averageSavedMinor = monthly.length ? Math.round(totalSavedMinor / monthly.length) : 0;
    const averageRatePct = monthly.length
      ? round2(monthly.reduce((sum, m) => sum + m.savingsRatePct, 0) / monthly.length)
      : 0;

    return {
      rangeStart: query.from,
      rangeEnd: query.to,
      currency,
      months: monthly,
      totalSaved: { amountMinor: totalSavedMinor, currency },
      averageSaved: { amountMinor: averageSavedMinor, currency },
      averageRatePct,
      bestMonth: this.extremeMonth(monthly, 'max'),
      worstMonth: this.extremeMonth(monthly, 'min'),
    };
  }

  /** Forecast future savings from recent history using the selected method. */
  async getProjection(
    userId: string,
    query: SavingsProjectionQueryDto,
  ): Promise<SavingsProjection> {
    const asOf = query.asOf ?? currentMonthKey();
    const start = shiftMonthKey(asOf, -(query.lookback - 1));
    const historyMonths = monthKeyRange(start, asOf, query.lookback);
    const monthly = await this.computeMonthlySavingsBatch(userId, historyMonths);
    const currency = this.resolveSeriesCurrency(monthly);
    const series = monthly.map((m) => m.savings.amountMinor);

    this.logger.log(
      `Savings projection: ${query.method} horizon=${query.months} lookback=${query.lookback} [user ${userId}]`,
    );

    return this.buildProjection(series, monthly, query, asOf, currency);
  }

  /** Builds a projection from a pre-loaded savings series (avoids duplicate DB reads). */
  buildProjectionFromHistory(
    history: SavingsHistory,
    query: Pick<SavingsProjectionQueryDto, 'months' | 'lookback' | 'method'>,
    asOf: MonthKey,
  ): SavingsProjection {
    const series = history.months.map((m) => m.savings.amountMinor);
    return this.buildProjection(series, history.months, query, asOf, history.currency);
  }

  /** Single-month calculation (3 parallel reads). */
  private async computeMonthlySavings(userId: string, month: MonthKey): Promise<MonthlySavings> {
    const [batch] = await this.computeMonthlySavingsBatch(userId, [month]);
    return batch!;
  }

  /**
   * Batch monthly savings: loads income/fixed plans once and variable expenses
   * in one aggregation — O(1) plan reads + O(1) aggregation instead of N×3.
   */
  private async computeMonthlySavingsBatch(
    userId: string,
    months: MonthKey[],
  ): Promise<MonthlySavings[]> {
    if (months.length === 0) return [];

    const from = months[0]!;
    const to = months[months.length - 1]!;

    const [incomeSources, fixedExpensePlans, variableByMonth, extraIncomeByMonth] =
      await Promise.all([
        this.income.listSources(userId, {}),
        this.fixedExpenses.listExpenses(userId, {}),
        this.transactions.sumByFlowGroupedByMonth(userId, from, to, Flow.EXPENSE),
        this.transactions.sumByFlowGroupedByMonth(userId, from, to, Flow.INCOME),
      ]);

    return months.map((monthKey) =>
      this.computeMonthFromPlans(
        monthKey,
        incomeSources,
        fixedExpensePlans,
        variableByMonth,
        extraIncomeByMonth,
      ),
    );
  }

  private computeMonthFromPlans(
    monthKey: MonthKey,
    incomeSources: readonly IncomeSource[],
    fixedExpensePlans: readonly FixedExpense[],
    variableByMonth: ReadonlyMap<MonthKey, Money>,
    extraIncomeByMonth: ReadonlyMap<MonthKey, Money>,
  ): MonthlySavings {
    let incomeMinor = 0;
    let fixedMinor = 0;
    const monies: Money[] = [];

    for (const source of incomeSources) {
      if (!isActiveInMonth(source, monthKey)) continue;
      const amount = effectiveAmountForMonth(source, monthKey);
      if (amount && amount.amountMinor > 0) {
        incomeMinor += amount.amountMinor;
        monies.push(amount);
      }
    }

    const extraIncome =
      extraIncomeByMonth.get(monthKey) ?? ({ amountMinor: 0, currency: CurrencyCode.USD } as Money);
    if (extraIncome.amountMinor > 0) {
      incomeMinor += extraIncome.amountMinor;
      monies.push(extraIncome);
    }

    for (const expense of fixedExpensePlans) {
      if (!isActiveInMonth(expense, monthKey)) continue;
      const amount = effectiveAmountForMonth(expense, monthKey);
      if (amount && amount.amountMinor > 0) {
        fixedMinor += amount.amountMinor;
        monies.push(amount);
      }
    }

    const variableExpense =
      variableByMonth.get(monthKey) ?? ({ amountMinor: 0, currency: CurrencyCode.USD } as Money);
    if (variableExpense.amountMinor > 0) monies.push(variableExpense);

    const currency = resolveCurrencyFromMonies(monies);
    const totalExpenseMinor = fixedMinor + variableExpense.amountMinor;
    const savingsMinor = incomeMinor - totalExpenseMinor;
    const savingsRatePct = incomeMinor > 0 ? round2((savingsMinor / incomeMinor) * 100) : 0;

    return {
      monthKey,
      currency,
      income: { amountMinor: incomeMinor, currency },
      fixedExpense: { amountMinor: fixedMinor, currency },
      variableExpense: { amountMinor: variableExpense.amountMinor, currency },
      totalExpense: { amountMinor: totalExpenseMinor, currency },
      savings: { amountMinor: savingsMinor, currency },
      savingsRatePct,
    };
  }

  private buildProjection(
    series: number[],
    monthly: readonly MonthlySavings[],
    query: Pick<SavingsProjectionQueryDto, 'months' | 'lookback' | 'method'>,
    asOf: MonthKey,
    currency: CurrencyCode,
  ): SavingsProjection {
    const { values, confidencePct } = forecastSavings(series, query.method, query.months);

    let cumulative = 0;
    const points: SavingsProjectionPoint[] = values.map((value, index) => {
      cumulative += value;
      return {
        monthKey: shiftMonthKey(asOf, index + 1),
        projectedSavings: { amountMinor: value, currency },
        projectedCumulative: { amountMinor: cumulative, currency },
      };
    });

    return {
      method: query.method,
      basedOnMonths: monthly.filter(hasActivity).length,
      lookbackMonths: query.lookback,
      horizonMonths: query.months,
      confidencePct,
      currency,
      months: points,
      nextMonth: points[0] ?? null,
    };
  }

  private resolveSeriesCurrency(months: readonly MonthlySavings[]): CurrencyCode {
    const representatives = months
      .filter(hasActivity)
      .map((m) => (m.income.amountMinor !== 0 ? m.income : m.totalExpense));
    return resolveCurrencyFromMonies(representatives);
  }

  private extremeMonth(months: readonly MonthlySavings[], mode: 'max' | 'min'): MonthKey | null {
    const active = months.filter(hasActivity);
    if (active.length === 0) return null;
    return active.reduce((best, current) => {
      const better =
        mode === 'max'
          ? current.savings.amountMinor > best.savings.amountMinor
          : current.savings.amountMinor < best.savings.amountMinor;
      return better ? current : best;
    }).monthKey;
  }
}

function hasActivity(month: MonthlySavings): boolean {
  return (
    month.income.amountMinor !== 0 ||
    month.fixedExpense.amountMinor !== 0 ||
    month.variableExpense.amountMinor !== 0
  );
}
