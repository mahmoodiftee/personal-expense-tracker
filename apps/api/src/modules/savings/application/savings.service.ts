import { Inject, Injectable } from '@nestjs/common';
import {
  CurrencyCode,
  Flow,
  type Money,
  type MonthKey,
  type MonthlySavings,
  type SavingsHistory,
  type SavingsProjection,
  type SavingsProjectionPoint,
} from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import { currentMonthKey, monthKeyRange, shiftMonthKey } from '../../../common/util/month.util';
import { IncomeService } from '../../income/application/income.service';
import { FixedExpenseService } from '../../fixed-expenses/application/fixed-expense.service';
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
    if (query.from > query.to) {
      throw new DomainValidationException('`from` month must not be after `to` month');
    }
    const months = monthKeyRange(query.from, query.to, MAX_HISTORY_MONTHS + 1);
    if (months.length > MAX_HISTORY_MONTHS) {
      throw new DomainValidationException(
        `History range cannot exceed ${MAX_HISTORY_MONTHS} months`,
      );
    }

    const monthly = await Promise.all(months.map((m) => this.computeMonthlySavings(userId, m)));
    const currency = this.resolveSeriesCurrency(monthly);

    const totalSavedMinor = monthly.reduce((sum, m) => sum + m.savings.amountMinor, 0);
    const averageSavedMinor = monthly.length ? Math.round(totalSavedMinor / monthly.length) : 0;
    const averageRatePct = monthly.length
      ? round2(monthly.reduce((sum, m) => sum + m.savingsRatePct, 0) / monthly.length)
      : 0;

    const best = this.extremeMonth(monthly, 'max');
    const worst = this.extremeMonth(monthly, 'min');

    return {
      rangeStart: query.from,
      rangeEnd: query.to,
      currency,
      months: monthly,
      totalSaved: { amountMinor: totalSavedMinor, currency },
      averageSaved: { amountMinor: averageSavedMinor, currency },
      averageRatePct,
      bestMonth: best,
      worstMonth: worst,
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

    const monthly = await Promise.all(
      historyMonths.map((m) => this.computeMonthlySavings(userId, m)),
    );
    const currency = this.resolveSeriesCurrency(monthly);
    const series = monthly.map((m) => m.savings.amountMinor); // oldest → newest

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

    const basedOnMonths = monthly.filter(hasActivity).length;
    this.logger.log(
      `Savings projection: ${query.method} horizon=${query.months} lookback=${query.lookback} [user ${userId}]`,
    );

    return {
      method: query.method,
      basedOnMonths,
      lookbackMonths: query.lookback,
      horizonMonths: query.months,
      confidencePct,
      currency,
      months: points,
      nextMonth: points[0] ?? null,
    };
  }

  /** Core calculation: compose income, fixed (due), and variable (actual). */
  private async computeMonthlySavings(userId: string, month: MonthKey): Promise<MonthlySavings> {
    const [incomeMonth, fixedStatus, flowTotals] = await Promise.all([
      this.income.getMonthlyIncome(userId, month),
      this.fixedExpenses.getMonthlyStatus(userId, month),
      this.transactions.sumByFlowForMonth(userId, month),
    ]);

    const income = incomeMonth.total;
    const fixedExpense = fixedStatus.totalDue;
    const variableExpense =
      flowTotals.find((f) => f.flow === Flow.EXPENSE)?.total ??
      ({ amountMinor: 0, currency: CurrencyCode.USD } as Money);

    const currency = this.resolveCurrency([income, fixedExpense, variableExpense]);
    const totalExpenseMinor = fixedExpense.amountMinor + variableExpense.amountMinor;
    const savingsMinor = income.amountMinor - totalExpenseMinor;
    const savingsRatePct =
      income.amountMinor > 0 ? round2((savingsMinor / income.amountMinor) * 100) : 0;

    return {
      monthKey: month,
      currency,
      income: { amountMinor: income.amountMinor, currency },
      fixedExpense: { amountMinor: fixedExpense.amountMinor, currency },
      variableExpense: { amountMinor: variableExpense.amountMinor, currency },
      totalExpense: { amountMinor: totalExpenseMinor, currency },
      savings: { amountMinor: savingsMinor, currency },
      savingsRatePct,
    };
  }

  /** Single currency across amounts, ignoring zero amounts (which carry defaults). */
  private resolveCurrency(monies: readonly Money[]): CurrencyCode {
    const currencies = new Set(monies.filter((m) => m.amountMinor !== 0).map((m) => m.currency));
    if (currencies.size > 1) {
      throw new DomainValidationException('Mixed currencies are not supported yet');
    }
    return [...currencies][0] ?? CurrencyCode.USD;
  }

  private resolveSeriesCurrency(months: readonly MonthlySavings[]): CurrencyCode {
    const representatives = months
      .filter(hasActivity)
      .map((m) => (m.income.amountMinor !== 0 ? m.income : m.totalExpense));
    return this.resolveCurrency(representatives);
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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Whether a month has any income or expense activity (excludes empty months). */
function hasActivity(month: MonthlySavings): boolean {
  return (
    month.income.amountMinor !== 0 ||
    month.fixedExpense.amountMinor !== 0 ||
    month.variableExpense.amountMinor !== 0
  );
}
