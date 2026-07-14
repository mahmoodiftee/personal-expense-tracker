import type { CategoryBudget, MonthKey, Money } from '@finance/shared';
import type { BaseRepositoryPort } from '../../../common/domain/repository.port';

export const CATEGORY_BUDGET_REPOSITORY = Symbol('CATEGORY_BUDGET_REPOSITORY');

export interface CreateCategoryBudgetData {
  readonly userId: string;
  readonly categoryId: string;
  readonly monthKey: MonthKey;
  readonly limitAmount: Money;
}

export interface UpdateCategoryBudgetData {
  readonly limitAmount?: Money;
}

export interface CategoryBudgetRepositoryPort extends BaseRepositoryPort<
  CategoryBudget,
  CreateCategoryBudgetData,
  UpdateCategoryBudgetData
> {
  findByMonth(userId: string, monthKey: MonthKey): Promise<readonly CategoryBudget[]>;
  findByCategoryAndMonth(
    userId: string,
    categoryId: string,
    monthKey: MonthKey,
  ): Promise<CategoryBudget | null>;
}
