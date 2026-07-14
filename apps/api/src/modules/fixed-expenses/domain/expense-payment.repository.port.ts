import type { Money, MonthKey, PaymentStatus } from '@finance/shared';

export const EXPENSE_PAYMENT_REPOSITORY = Symbol('EXPENSE_PAYMENT_REPOSITORY');

/** A persisted payment-status record for one fixed expense in one month. */
export interface ExpensePaymentRecord {
  readonly planId: string;
  readonly monthKey: MonthKey;
  readonly status: PaymentStatus;
  readonly amount: Money;
  readonly paidAt: string | null; // ISO-8601 or null
}

export interface UpsertPaymentData {
  readonly userId: string;
  readonly planId: string;
  readonly monthKey: MonthKey;
  readonly status: PaymentStatus;
  readonly amount: Money;
  readonly paidAt: string | null;
}

/**
 * Persistence contract for fixed-expense monthly payment status. One record per
 * (userId, planId, monthKey); marking paid/unpaid is an idempotent upsert.
 */
export interface ExpensePaymentRepositoryPort {
  upsert(data: UpsertPaymentData): Promise<ExpensePaymentRecord>;
  findByMonth(userId: string, monthKey: MonthKey): Promise<readonly ExpensePaymentRecord[]>;
  findRange(userId: string, from: MonthKey, to: MonthKey): Promise<readonly ExpensePaymentRecord[]>;
  /** Remove all payment records for a plan (used when the expense is deleted). */
  deleteForPlan(userId: string, planId: string): Promise<number>;
}
