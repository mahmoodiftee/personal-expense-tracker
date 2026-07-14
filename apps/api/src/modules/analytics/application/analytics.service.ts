import { Inject, Injectable } from '@nestjs/common';
import {
  CurrencyCode,
  Flow,
  ForecastMethod,
  type CategorySpendingPoint,
  type ForecastAnalytics,
  type ForecastMethodComparison,
  type Money,
  type MonthKey,
  type MonthlySavings,
  type MonthlyTrendPoint,
  type MonthlyTrends,
  type SavingsTrendPoint,
  type SavingsTrends,
  type SpendingTrendPoint,
  type SpendingTrends,
} from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import { round2 } from '../../../common/util/math.util';
import { currentMonthKey, shiftMonthKey } from '../../../common/util/month.util';
import { validateMonthRange } from '../../../common/validation/validate-month-range';
import { SavingsService } from '../../savings/application/savings.service';
import { forecastSavings } from '../../savings/domain/forecast.engine';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../transactions/domain/transaction.repository.port';
import {
  averageMinor,
  computeSeriesDirection,
  computeTrendDelta,
} from '../domain/trend.calculations';
import type { AnalyticsRangeQueryDto, ForecastAnalyticsQueryDto } from './dto/analytics-query.dto';

/** Guards runaway aggregation windows. */
const MAX_RANGE_MONTHS = 60;
/** Top categories shown per month in spending trends. */
const TOP_CATEGORIES = 5;

/**
 * Analytics use cases. Composes {@link SavingsService} and the transaction
 * repository into richer trend and forecast views — no collection of its own
 * (Computed Pattern, SRP, DIP).
 */
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly savings: SavingsService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AnalyticsService.name);
  }

  /** Income, expense, and savings trends with month-over-month deltas. */
  async getMonthlyTrends(userId: string, query: AnalyticsRangeQueryDto): Promise<MonthlyTrends> {
    const months = validateMonthRange(query.from, query.to, MAX_RANGE_MONTHS);
    const monthly = await this.loadMonthlySeries(userId, months);

    const points: MonthlyTrendPoint[] = monthly.map((m, index) => ({
      monthKey: m.monthKey,
      income: m.income,
      totalExpenses: m.totalExpense,
      savings: m.savings,
      savingsRatePct: m.savingsRatePct,
      changeFromPrevious:
        index === 0
          ? null
          : computeTrendDelta(m.savings.amountMinor, monthly[index - 1]!.savings.amountMinor),
    }));

    const currency = monthly[0]?.currency ?? CurrencyCode.USD;
    const savingsSeries = monthly.map((m) => m.savings.amountMinor);

    this.logger.log(`Monthly trends ${query.from}..${query.to} [user ${userId}]`);

    return {
      rangeStart: query.from,
      rangeEnd: query.to,
      currency,
      points,
      summary: {
        averageIncome: avgMoney(
          monthly.map((m) => m.income.amountMinor),
          currency,
        ),
        averageExpenses: avgMoney(
          monthly.map((m) => m.totalExpense.amountMinor),
          currency,
        ),
        averageSavings: avgMoney(savingsSeries, currency),
        overallDirection: computeSeriesDirection(savingsSeries),
      },
    };
  }

  /** Savings-focused trend with totals, extremes, and direction. */
  async getSavingsTrends(userId: string, query: AnalyticsRangeQueryDto): Promise<SavingsTrends> {
    const history = await this.savings.getHistory(userId, query);

    const points: SavingsTrendPoint[] = history.months.map((m, index) => ({
      monthKey: m.monthKey,
      savings: m.savings,
      savingsRatePct: m.savingsRatePct,
      changeFromPrevious:
        index === 0
          ? null
          : computeTrendDelta(
              m.savings.amountMinor,
              history.months[index - 1]!.savings.amountMinor,
            ),
    }));

    const savingsSeries = history.months.map((m) => m.savings.amountMinor);

    this.logger.log(`Savings trends ${query.from}..${query.to} [user ${userId}]`);

    return {
      rangeStart: history.rangeStart,
      rangeEnd: history.rangeEnd,
      currency: history.currency,
      points,
      totalSaved: history.totalSaved,
      averageSaved: history.averageSaved,
      averageRatePct: history.averageRatePct,
      bestMonth: history.bestMonth,
      worstMonth: history.worstMonth,
      trendDirection: computeSeriesDirection(savingsSeries),
    };
  }

  /** Fixed vs variable spending and top categories per month. */
  async getSpendingTrends(userId: string, query: AnalyticsRangeQueryDto): Promise<SpendingTrends> {
    const months = validateMonthRange(query.from, query.to, MAX_RANGE_MONTHS);

    const [monthly, categoryRows] = await Promise.all([
      this.loadMonthlySeries(userId, months),
      Promise.all(
        months.map((monthKey) =>
          this.transactions.breakdownByCategory(userId, monthKey, Flow.EXPENSE),
        ),
      ),
    ]);

    const currency = monthly[0]?.currency ?? CurrencyCode.USD;

    const points: SpendingTrendPoint[] = months.map((monthKey, index) => {
      const m = monthly[index]!;
      const cats = categoryRows[index] ?? [];
      const totalMinor = cats.reduce((sum, c) => sum + c.total.amountMinor, 0);
      const topCategories: CategorySpendingPoint[] = cats.slice(0, TOP_CATEGORIES).map((c) => ({
        name: c.categoryName,
        color: c.color,
        total: c.total,
        sharePct: totalMinor ? round2((c.total.amountMinor / totalMinor) * 100) : 0,
      }));

      return {
        monthKey,
        fixed: m.fixedExpense,
        variable: m.variableExpense,
        total: m.totalExpense,
        topCategories,
      };
    });

    const fixedSeries = monthly.map((m) => m.fixedExpense.amountMinor);
    const variableSeries = monthly.map((m) => m.variableExpense.amountMinor);
    const totalFixed = fixedSeries.reduce((s, v) => s + v, 0);
    const totalVariable = variableSeries.reduce((s, v) => s + v, 0);
    const totalSpending = totalFixed + totalVariable;

    this.logger.log(`Spending trends ${query.from}..${query.to} [user ${userId}]`);

    return {
      rangeStart: query.from,
      rangeEnd: query.to,
      currency,
      points,
      summary: {
        averageFixed: avgMoney(fixedSeries, currency),
        averageVariable: avgMoney(variableSeries, currency),
        averageTotal: avgMoney(
          monthly.map((m) => m.totalExpense.amountMinor),
          currency,
        ),
        fixedSharePct: totalSpending ? round2((totalFixed / totalSpending) * 100) : 0,
        variableSharePct: totalSpending ? round2((totalVariable / totalSpending) * 100) : 0,
      },
    };
  }

  /** Forecast with historical context and side-by-side method comparison. */
  async getForecastAnalytics(
    userId: string,
    query: ForecastAnalyticsQueryDto,
  ): Promise<ForecastAnalytics> {
    const asOf = query.asOf ?? currentMonthKey();
    const historyStart = shiftMonthKey(asOf, -(query.lookback - 1));
    const history = await this.savings.getHistory(userId, { from: historyStart, to: asOf });
    const projection = this.savings.buildProjectionFromHistory(history, query, asOf);

    const currency = history.currency;
    const series = history.months.map((m) => m.savings.amountMinor);
    const projectedValues = projection.months.map((p) => p.projectedSavings.amountMinor);

    const historicalAverage: Money = {
      amountMinor: averageMinor(series),
      currency,
    };
    const projectedAverage: Money = {
      amountMinor: averageMinor(projectedValues),
      currency,
    };
    const projectedTotal: Money = {
      amountMinor: projectedValues.reduce((sum, v) => sum + v, 0),
      currency,
    };

    const methodComparison: ForecastMethodComparison[] = (
      [ForecastMethod.SMA, ForecastMethod.WMA, ForecastMethod.LINEAR_REGRESSION] as const
    ).map((method) => {
      const { values, confidencePct } = forecastSavings(series, method, 1);
      return {
        method,
        nextMonthProjected: { amountMinor: values[0] ?? 0, currency },
        confidencePct,
      };
    });

    this.logger.log(`Forecast analytics asOf=${asOf} method=${query.method} [user ${userId}]`);

    return {
      asOf,
      currency,
      projection,
      historicalAverage,
      projectedAverage,
      projectedTotal,
      trendVsHistorical: computeTrendDelta(
        projectedAverage.amountMinor,
        historicalAverage.amountMinor,
      ),
      methodComparison,
    };
  }

  private loadMonthlySeries(userId: string, months: MonthKey[]): Promise<MonthlySavings[]> {
    if (months.length === 0) return Promise.resolve([]);
    return this.savings
      .getHistory(userId, { from: months[0]!, to: months[months.length - 1]! })
      .then((history) => [...history.months]);
  }
}

function avgMoney(values: readonly number[], currency: CurrencyCode): Money {
  return { amountMinor: averageMinor(values), currency };
}
