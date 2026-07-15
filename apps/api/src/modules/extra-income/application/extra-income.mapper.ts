import type { ExtraIncome, Transaction } from '@finance/shared';

export function toExtraIncome(tx: Transaction): ExtraIncome {
  return {
    id: tx.id,
    userId: tx.userId,
    amount: tx.amount,
    description: tx.description,
    notes: tx.notes,
    occurredAt: tx.occurredAt,
    monthKey: tx.monthKey,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  };
}
