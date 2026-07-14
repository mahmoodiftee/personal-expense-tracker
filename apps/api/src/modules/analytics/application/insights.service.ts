import { Inject, Injectable } from '@nestjs/common';
import { Flow, type CategoryBudgetStatus, type Insight, type MonthKey } from '@finance/shared';

import { AppLogger } from '../../../core/logger/app-logger.service';
import { currentMonthKey, previousMonthKey, shiftMonthKey } from '../../../common/util/month.util';
import { FixedExpenseService } from '../../fixed-expenses/application/fixed-expense.service';
import { BudgetsService } from '../../budgets/application/budgets.service';
import { SavingsService } from '../../savings/application/savings.service';
import {
  TRANSACTION_REPOSITORY,
  type CategoryAggregate,
  type TransactionRepositoryPort,
} from '../../transactions/domain/transaction.repository.port';
import {
  generateInsights,
  NEW_CATEGORY_LOOKBACK_MONTHS,
  type BudgetOverrunRow,
  type CategorySpendRow,
  type InsightsEngineInput,
} from '../domain/insights.engine';
import {
  INSIGHT_REPOSITORY,
  type CreateInsightData,
  type InsightRepositoryPort,
} from '../domain/insight.repository.port';
import type { ListInsightsQueryDto } from './dto/list-insights-query.dto';

@Injectable()
export class InsightsService {
  constructor(
    @Inject(INSIGHT_REPOSITORY)
    private readonly insights: InsightRepositoryPort,
    private readonly savings: SavingsService,
    private readonly budgets: BudgetsService,
    private readonly fixedExpenses: FixedExpenseService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(InsightsService.name);
  }

  async listInsights(userId: string, query: ListInsightsQueryDto): Promise<readonly Insight[]> {
    const monthKey = (query.month ?? currentMonthKey()) as MonthKey;

    await this.regenerateInsights(userId, monthKey);

    const items = await this.insights.findMany(userId, {
      monthKey,
      limit: query.limit,
    });

    this.logger.log(`Insights listed: ${items.length} [user ${userId}] month=${monthKey}`);
    return items;
  }

  private async regenerateInsights(userId: string, monthKey: MonthKey): Promise<void> {
    const input = await this.buildEngineInput(userId, monthKey);
    const drafts = generateInsights(input);

    await this.insights.deleteByMonth(userId, monthKey);
    if (drafts.length === 0) return;

    const payload: CreateInsightData[] = drafts.map((draft) => ({
      userId,
      type: draft.type,
      severity: draft.severity,
      title: draft.title,
      message: draft.message,
      data: draft.data ?? null,
      monthKey: draft.monthKey,
    }));

    await this.insights.createMany(payload);
    this.logger.log(`Insights regenerated: ${payload.length} [user ${userId}] month=${monthKey}`);
  }

  private async buildEngineInput(userId: string, monthKey: MonthKey): Promise<InsightsEngineInput> {
    const priorMonthKey = previousMonthKey(monthKey);
    const historyFrom = shiftMonthKey(monthKey, -NEW_CATEGORY_LOOKBACK_MONTHS);
    const historyTo = shiftMonthKey(monthKey, -1);

    const [
      currentMonth,
      previousMonth,
      currentCategories,
      historicalCategoriesByMonth,
      fixedExpenseStatus,
      budgetAnalytics,
    ] = await Promise.all([
      this.savings.getMonthly(userId, { month: monthKey }),
      this.savings.getMonthly(userId, { month: priorMonthKey }),
      this.transactions.breakdownByCategory(userId, monthKey, Flow.EXPENSE),
      historyTo >= historyFrom
        ? this.transactions.breakdownByCategoryGroupedByMonth(
            userId,
            historyFrom,
            historyTo,
            Flow.EXPENSE,
          )
        : Promise.resolve(new Map<MonthKey, readonly CategoryAggregate[]>()),
      this.fixedExpenses.getMonthlyStatus(userId, monthKey),
      this.budgets.getBudgetAnalytics(userId, monthKey),
    ]);

    const hasPreviousData =
      previousMonth.totalExpense.amountMinor > 0 ||
      previousMonth.income.amountMinor > 0 ||
      previousMonth.savings.amountMinor !== 0;

    return {
      monthKey,
      currentMonth,
      previousMonth: hasPreviousData ? previousMonth : null,
      currentCategories: currentCategories.map(toCategorySpendRow),
      historicalCategoriesByMonth: mapHistoricalCategories(historicalCategoriesByMonth),
      fixedExpenseStatus,
      overBudgetCategories: budgetAnalytics.overBudget.map(toBudgetOverrunRow),
    };
  }
}

function toCategorySpendRow(row: CategoryAggregate): CategorySpendRow {
  return {
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    color: row.color,
    totalMinor: row.total.amountMinor,
    transactionCount: row.transactionCount,
  };
}

function mapHistoricalCategories(
  grouped: ReadonlyMap<MonthKey, readonly CategoryAggregate[]>,
): ReadonlyMap<MonthKey, readonly CategorySpendRow[]> {
  const mapped = new Map<MonthKey, readonly CategorySpendRow[]>();
  for (const [month, rows] of grouped.entries()) {
    mapped.set(month, rows.map(toCategorySpendRow));
  }
  return mapped;
}

function toBudgetOverrunRow(row: CategoryBudgetStatus): BudgetOverrunRow {
  return {
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    budgetMinor: row.budget.amountMinor,
    actualMinor: row.actual.amountMinor,
    usedPct: row.usedPct,
    currency: row.budget.currency,
  };
}
