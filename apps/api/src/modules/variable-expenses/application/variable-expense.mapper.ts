import { PaymentStatus, type Transaction, type VariableExpense } from '@finance/shared';

/** Projects a ledger {@link Transaction} onto the variable-expense read model. */
export function toVariableExpense(tx: Transaction): VariableExpense {
  const status = tx.paymentStatus ?? PaymentStatus.PAID;

  return {
    id: tx.id,
    userId: tx.userId,
    amount: tx.amount,
    category: {
      id: tx.categoryId,
      name: tx.categorySnapshot.name,
      color: tx.categorySnapshot.color,
      icon: tx.categorySnapshot.icon,
    },
    description: tx.description,
    notes: tx.notes,
    tags: tx.tags,
    occurredAt: tx.occurredAt,
    monthKey: tx.monthKey,
    status,
    paidAt: status === PaymentStatus.PAID ? (tx.paidAt ?? tx.occurredAt) : null,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  };
}
