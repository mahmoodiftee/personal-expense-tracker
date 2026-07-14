import type { Money } from './money';
import type { AmountPeriod, EntityTimestamps, MonthKey } from './models';
import type { Cadence, CurrencyCode, PaymentStatus, RecurringStatus } from './enums';

/**
 * Fixed-expense domain read models. A fixed expense is a recurring plan of
 * `kind = FIXED_EXPENSE` with per-month payment tracking (paid/unpaid).
 */

export interface FixedExpense extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  /** Amount effective for the current month (derived from {@link amountHistory}). */
  readonly amount: Money;
  readonly amountHistory: readonly AmountPeriod[];
  readonly cadence: Cadence;
  readonly dueDay: number;
  readonly status: RecurringStatus;
  readonly startMonth: MonthKey;
  readonly endMonth: MonthKey | null;
  readonly categoryId: string | null;
}

/** A fixed expense's due amount and payment state for a specific month. */
export interface FixedExpenseMonthlyStatusItem {
  readonly expenseId: string;
  readonly name: string;
  readonly dueDay: number;
  readonly amount: Money;
  readonly status: PaymentStatus;
  readonly paidAt: string | null; // ISO-8601 or null
}

/** Aggregate paid/unpaid picture for all fixed expenses in a month. */
export interface MonthlyExpenseStatus {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly totalDue: Money;
  readonly totalPaid: Money;
  readonly totalUnpaid: Money;
  readonly paidCount: number;
  readonly unpaidCount: number;
  readonly items: readonly FixedExpenseMonthlyStatusItem[];
}

export interface ExpenseSummaryMonth {
  readonly monthKey: MonthKey;
  readonly due: Money;
  readonly paid: Money;
}

export interface ExpenseShare {
  readonly expenseId: string;
  readonly name: string;
  readonly totalDue: Money;
  readonly totalPaid: Money;
  readonly sharePct: number;
}

/** Aggregated fixed-expense totals across a month range. */
export interface ExpenseSummary {
  readonly rangeStart: MonthKey;
  readonly rangeEnd: MonthKey;
  readonly currency: CurrencyCode;
  readonly totalDue: Money;
  readonly totalPaid: Money;
  readonly months: readonly ExpenseSummaryMonth[];
  readonly byExpense: readonly ExpenseShare[];
}
