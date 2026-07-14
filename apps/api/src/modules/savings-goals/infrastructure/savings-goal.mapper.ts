import type { SavingsGoal } from '@finance/shared';
import type { HydratedDocument } from 'mongoose';

import type { SavingsGoalEntity } from './savings-goal.schema';

export function toSavingsGoal(doc: HydratedDocument<SavingsGoalEntity>): SavingsGoal {
  const timestamps = doc as { createdAt?: Date; updatedAt?: Date };
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: doc.name,
    template: doc.template,
    targetAmount: {
      amountMinor: doc.targetAmount.amountMinor,
      currency: doc.targetAmount.currency,
    },
    currentAmount: {
      amountMinor: doc.currentAmount.amountMinor,
      currency: doc.currentAmount.currency,
    },
    targetDate: doc.targetDate ? doc.targetDate.toISOString() : null,
    notes: doc.notes,
    createdAt: timestamps.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: timestamps.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
