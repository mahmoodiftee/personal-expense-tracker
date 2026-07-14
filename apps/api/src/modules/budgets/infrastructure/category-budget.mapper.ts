import type { CategoryBudget } from '@finance/shared';
import type { HydratedDocument } from 'mongoose';

import type { CategoryBudgetEntity } from './category-budget.schema';

export function toCategoryBudget(doc: HydratedDocument<CategoryBudgetEntity>): CategoryBudget {
  const timestamps = doc as { createdAt?: Date; updatedAt?: Date };
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    categoryId: doc.categoryId.toString(),
    monthKey: doc.monthKey,
    limitAmount: {
      amountMinor: doc.limitAmount.amountMinor,
      currency: doc.limitAmount.currency,
    },
    createdAt: timestamps.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: timestamps.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
