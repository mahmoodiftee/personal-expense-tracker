import { Inject, Injectable } from '@nestjs/common';
import {
  Flow,
  type DashboardCategoryItem,
  type DashboardForecast,
  type DashboardMonthlyOverview,
  type DashboardMonthlyOverviewItem,
  type DashboardOverview,
  type DashboardSnapshot,
} from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import { currentMonthKey } from '../../../common/util/month.util';
import { SavingsService } from '../../savings/application/savings.service';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../transactions/domain/transaction.repository.port';
import type {
  DashboardMonthlyOverviewQueryDto,
  DashboardQueryDto,
} from './dto/dashboard-query.dto';

/**
 * Dashboard use cases. A thin orchestration layer over {@link SavingsService}
 * and the transaction repository — no persistence of its own (SRP, DIP, DRY).
 * One call returns everything the dashboard UI needs for a month.
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly savings: SavingsService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DashboardService.name);
  }

  /** Full dashboard for a month: totals, breakdown, and forecast. */
  async getOverview(userId: string, query: DashboardQueryDto): Promise<DashboardOverview> {
    const monthKey = query.month ?? currentMonthKey();

    const [monthly, categories, projection] = await Promise.all([
      this.savings.getMonthly(userId, { month: monthKey }),
      this.transactions.breakdownByCategory(userId, monthKey, Flow.EXPENSE),
      this.savings.getProjection(userId, {
        asOf: monthKey,
        months: query.forecastMonths,
        lookback: query.forecastLookback,
        method: query.forecastMethod,
      }),
    ]);

    const snapshot = this.toSnapshot(monthly);
    const categoryBreakdown = this.toCategoryBreakdown(categories);
    const forecast: DashboardForecast = {
      method: projection.method,
      confidencePct: projection.confidencePct,
      basedOnMonths: projection.basedOnMonths,
      nextMonth: projection.nextMonth,
      horizon: projection.months,
    };

    this.logger.log(`Dashboard overview loaded for ${monthKey} [user ${userId}]`);

    return {
      monthKey,
      currency: monthly.currency,
      snapshot,
      categoryBreakdown,
      forecast,
    };
  }

  /** Multi-month trend for charts (income, expenses, savings over time). */
  async getMonthlyOverview(
    userId: string,
    query: DashboardMonthlyOverviewQueryDto,
  ): Promise<DashboardMonthlyOverview> {
    const history = await this.savings.getHistory(userId, query);

    const months: DashboardMonthlyOverviewItem[] = history.months.map((m) => ({
      monthKey: m.monthKey,
      totalIncome: m.income,
      totalExpenses: m.totalExpense,
      remainingBalance: m.savings,
      savings: m.savings,
      savingsRatePct: m.savingsRatePct,
    }));

    this.logger.log(`Dashboard monthly overview ${query.from}..${query.to} [user ${userId}]`);

    return {
      rangeStart: history.rangeStart,
      rangeEnd: history.rangeEnd,
      currency: history.currency,
      months,
    };
  }

  private toSnapshot(
    monthly: Awaited<ReturnType<SavingsService['getMonthly']>>,
  ): DashboardSnapshot {
    return {
      monthKey: monthly.monthKey,
      currency: monthly.currency,
      totalIncome: monthly.income,
      totalExpenses: monthly.totalExpense,
      remainingBalance: monthly.savings,
      savings: { amount: monthly.savings, ratePct: monthly.savingsRatePct },
      expenseBreakdown: {
        fixed: monthly.fixedExpense,
        variable: monthly.variableExpense,
      },
    };
  }

  private toCategoryBreakdown(
    rows: Awaited<ReturnType<TransactionRepositoryPort['breakdownByCategory']>>,
  ): DashboardCategoryItem[] {
    const totalMinor = rows.reduce((sum, row) => sum + row.total.amountMinor, 0);
    return rows.map((row) => ({
      categoryId: row.categoryId,
      name: row.categoryName,
      color: row.color,
      total: row.total,
      transactionCount: row.transactionCount,
      sharePct: totalMinor ? round2((row.total.amountMinor / totalMinor) * 100) : 0,
    }));
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
