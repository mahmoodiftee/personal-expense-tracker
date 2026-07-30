import type { CurrencyCode, RecurringStatus } from './enums';
import type { Money } from './money';
import type { MonthKey } from './models';

/** Progress snapshot for a bank loan tracked as a fixed expense. */
export interface LoanProgress {
  readonly totalTaken: Money;
  readonly paid: Money;
  readonly remaining: Money;
  readonly progressPct: number;
  readonly monthlyInstallment: Money | null;
  readonly monthsRemaining: number | null;
  readonly installmentsPaid: number;
}

export interface LoanWithProgress {
  readonly id: string;
  readonly name: string;
  readonly startMonth: MonthKey;
  readonly endMonth: MonthKey | null;
  readonly dueDay: number;
  readonly status: RecurringStatus;
  readonly progress: LoanProgress;
}

export interface LoansOverview {
  readonly asOf: MonthKey;
  readonly currency: CurrencyCode;
  readonly loans: readonly LoanWithProgress[];
}
