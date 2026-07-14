import type { CategoryBudgetStatus } from '@finance/shared';
import { MoneyMath } from '@finance/shared';

import type { BudgetFormValues } from './schemas';

export function defaultBudgetFormValues(month: string): BudgetFormValues {
  return {
    month,
    categoryId: '',
    limitAmount: '',
  };
}

export function budgetToFormValues(item: CategoryBudgetStatus, month: string): BudgetFormValues {
  return {
    month,
    categoryId: item.categoryId,
    limitAmount: String(MoneyMath.toMajor(item.budget)),
  };
}
