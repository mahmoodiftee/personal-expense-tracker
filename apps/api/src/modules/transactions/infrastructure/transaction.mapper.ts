import type { HydratedDocument } from 'mongoose';
import { Flow, PaymentStatus, type Transaction } from '@finance/shared';
import type { TransactionEntity } from './transaction.schema';

function resolvePaymentStatus(doc: HydratedDocument<TransactionEntity>): PaymentStatus | null {
  if (doc.paymentStatus) return doc.paymentStatus;
  if (doc.flow === Flow.EXPENSE && !doc.recurringPlanId) return PaymentStatus.PAID;
  return null;
}

/** Maps a persisted transaction document to its framework-free read model. */
export function toTransaction(doc: HydratedDocument<TransactionEntity>): Transaction {
  const timestamps = doc as { createdAt?: Date; updatedAt?: Date };
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    flow: doc.flow,
    amount: { amountMinor: doc.amount.amountMinor, currency: doc.amount.currency },
    categoryId: doc.categoryId ? doc.categoryId.toString() : null,
    categorySnapshot: {
      name: doc.categorySnapshot.name,
      color: doc.categorySnapshot.color,
      icon: doc.categorySnapshot.icon,
      kind: doc.categorySnapshot.kind,
    },
    recurringPlanId: doc.recurringPlanId ? doc.recurringPlanId.toString() : null,
    description: doc.description,
    notes: doc.notes ?? null,
    tags: [...doc.tags],
    occurredAt: doc.occurredAt.toISOString(),
    monthKey: doc.monthKey,
    paymentStatus: resolvePaymentStatus(doc),
    paidAt: doc.paidAt ? doc.paidAt.toISOString() : null,
    createdAt: timestamps.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: timestamps.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
