import { Inject, Injectable } from '@nestjs/common';
import {
  CategoryKind,
  CurrencyCode,
  Flow,
  type BudgetAnalytics,
  type Category,
  type CategoryBudget,
  type CategoryBudgetStatus,
  type MonthKey,
  type MonthlyBudgetSummary,
} from '@finance/shared';

import { AppLogger } from '../../../core/logger/app-logger.service';
import { reconcileCurrency } from '../../../common/domain/currency.util';
import {
  DomainValidationException,
  ResourceConflictException,
  ResourceNotFoundException,
} from '../../../common/exceptions/app.exception';
import { currentMonthKey } from '../../../common/util/month.util';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepositoryPort,
} from '../../categories/domain/category.repository.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../transactions/domain/transaction.repository.port';
import { computeBudgetTotals, computeCategoryBudgetStatus } from '../domain/budget-status.engine';
import {
  CATEGORY_BUDGET_REPOSITORY,
  type CategoryBudgetRepositoryPort,
} from '../domain/category-budget.repository.port';
import type { CreateCategoryBudgetDto } from './dto/create-category-budget.dto';
import type { UpdateCategoryBudgetDto } from './dto/update-category-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @Inject(CATEGORY_BUDGET_REPOSITORY)
    private readonly budgets: CategoryBudgetRepositoryPort,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(BudgetsService.name);
  }

  async createBudget(userId: string, dto: CreateCategoryBudgetDto): Promise<CategoryBudget> {
    await this.assertBudgetableCategory(userId, dto.categoryId);

    const existing = await this.budgets.findByCategoryAndMonth(userId, dto.categoryId, dto.month);
    if (existing) {
      throw new ResourceConflictException(
        'A budget already exists for this category and month. Use PATCH to update it.',
      );
    }

    if (dto.limitAmount.amountMinor <= 0) {
      throw new DomainValidationException('Budget limit must be greater than zero');
    }

    const budget = await this.budgets.create({
      userId,
      categoryId: dto.categoryId,
      monthKey: dto.month,
      limitAmount: dto.limitAmount,
    });

    this.logger.log(`Budget created: ${budget.id} [user ${userId}]`);
    return budget;
  }

  async updateBudget(
    userId: string,
    id: string,
    dto: UpdateCategoryBudgetDto,
  ): Promise<CategoryBudget> {
    if (dto.limitAmount.amountMinor <= 0) {
      throw new DomainValidationException('Budget limit must be greater than zero');
    }

    const updated = await this.budgets.update(userId, id, { limitAmount: dto.limitAmount });
    if (!updated) throw new ResourceNotFoundException('Category budget', id);

    this.logger.log(`Budget updated: ${id} [user ${userId}]`);
    return updated;
  }

  async deleteBudget(userId: string, id: string): Promise<void> {
    const existing = await this.budgets.findById(userId, id);
    if (!existing) throw new ResourceNotFoundException('Category budget', id);

    const deleted = await this.budgets.delete(userId, id);
    if (!deleted) throw new ResourceNotFoundException('Category budget', id);

    this.logger.log(`Budget deleted: ${id} [user ${userId}]`);
  }

  async getMonthlySummary(userId: string, month?: MonthKey): Promise<MonthlyBudgetSummary> {
    const monthKey = month ?? currentMonthKey();
    return this.buildMonthlySummary(userId, monthKey);
  }

  async getBudgetAnalytics(userId: string, month?: MonthKey): Promise<BudgetAnalytics> {
    const summary = await this.buildMonthlySummary(userId, month ?? currentMonthKey());

    return {
      monthKey: summary.monthKey,
      currency: summary.currency,
      overBudget: summary.categories.filter((item) => item.isOverBudget),
      underBudget: summary.categories.filter((item) => !item.isOverBudget),
    };
  }

  private async buildMonthlySummary(
    userId: string,
    monthKey: MonthKey,
  ): Promise<MonthlyBudgetSummary> {
    const [budgetRows, actualRows, categoryCatalog] = await Promise.all([
      this.budgets.findByMonth(userId, monthKey),
      this.transactions.breakdownByCategory(userId, monthKey, Flow.EXPENSE),
      this.categories.findMany(userId, { flow: Flow.EXPENSE, kind: CategoryKind.VARIABLE }),
    ]);

    const categoryMap = new Map(categoryCatalog.map((category) => [category.id, category]));
    const actualByCategoryId = new Map(
      actualRows.filter((row) => row.categoryId).map((row) => [row.categoryId, row] as const),
    );

    const statuses: CategoryBudgetStatus[] = budgetRows.map((budget) => {
      const category = categoryMap.get(budget.categoryId);
      const actualRow = actualByCategoryId.get(budget.categoryId);
      const currency = reconcileCurrency(
        budget.limitAmount.currency,
        actualRow?.total.currency ?? budget.limitAmount.currency,
      );

      const computed = computeCategoryBudgetStatus({
        categoryId: budget.categoryId,
        categoryName: category?.name ?? actualRow?.categoryName ?? 'Unknown category',
        color: category?.color ?? actualRow?.color ?? '#64748b',
        budgetMinor: budget.limitAmount.amountMinor,
        actualMinor: actualRow?.total.amountMinor ?? 0,
        currency,
      });

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        categoryName: category?.name ?? actualRow?.categoryName ?? 'Unknown category',
        color: category?.color ?? actualRow?.color ?? '#64748b',
        budget: { amountMinor: computed.budgetMinor, currency },
        actual: { amountMinor: computed.actualMinor, currency },
        remaining: { amountMinor: computed.remainingMinor, currency },
        usedPct: computed.usedPct,
        isOverBudget: computed.isOverBudget,
      };
    });

    const currency = statuses[0]?.budget.currency ?? CurrencyCode.USD;
    const computedRows = statuses.map((item) =>
      computeCategoryBudgetStatus({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        color: item.color,
        budgetMinor: item.budget.amountMinor,
        actualMinor: item.actual.amountMinor,
        currency: item.budget.currency,
      }),
    );
    const totals = computeBudgetTotals(computedRows, currency);

    return {
      monthKey,
      currency: totals.currency,
      totalBudget: { amountMinor: totals.totalBudgetMinor, currency: totals.currency },
      totalActual: { amountMinor: totals.totalActualMinor, currency: totals.currency },
      totalRemaining: { amountMinor: totals.totalRemainingMinor, currency: totals.currency },
      totalUsedPct: totals.totalUsedPct,
      categories: statuses.sort((a, b) => b.usedPct - a.usedPct),
    };
  }

  private async assertBudgetableCategory(userId: string, categoryId: string): Promise<Category> {
    const category = await this.categories.findById(userId, categoryId);
    if (!category) throw new ResourceNotFoundException('Category', categoryId);
    if (category.flow !== Flow.EXPENSE || category.kind !== CategoryKind.VARIABLE) {
      throw new DomainValidationException(
        'Budgets can only be set for variable expense categories',
      );
    }
    if (category.isArchived) {
      throw new DomainValidationException('Cannot budget an archived category');
    }
    return category;
  }
}
