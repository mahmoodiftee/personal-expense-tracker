import type { Cadence, FixedExpense, Money, MonthKey, RecurringStatus } from '@finance/shared';

export const FIXED_EXPENSE_REPOSITORY = Symbol('FIXED_EXPENSE_REPOSITORY');

export interface CreateFixedExpenseData {
  readonly userId: string;
  readonly name: string;
  readonly amount: Money;
  readonly cadence: Cadence;
  readonly dueDay: number;
  readonly startMonth: MonthKey;
  readonly endMonth?: MonthKey | null;
  readonly categoryId?: string | null;
}

export interface UpdateFixedExpenseData {
  readonly name?: string;
  readonly dueDay?: number;
  readonly status?: RecurringStatus;
  readonly endMonth?: MonthKey | null;
  readonly categoryId?: string | null;
}

export interface FixedExpenseQuery {
  readonly status?: RecurringStatus;
}

/**
 * Persistence contract for fixed expenses (recurring plans of
 * `kind = FIXED_EXPENSE`). Implemented by an adapter over the shared
 * `recurringPlans` collection.
 */
export interface FixedExpenseRepositoryPort {
  create(data: CreateFixedExpenseData): Promise<FixedExpense>;
  findById(userId: string, id: string): Promise<FixedExpense | null>;
  findMany(userId: string, query?: FixedExpenseQuery): Promise<readonly FixedExpense[]>;
  findActiveInMonth(userId: string, monthKey: MonthKey): Promise<readonly FixedExpense[]>;
  updateMeta(
    userId: string,
    id: string,
    changes: UpdateFixedExpenseData,
  ): Promise<FixedExpense | null>;
  appendAmount(
    userId: string,
    id: string,
    amount: Money,
    effectiveFrom: MonthKey,
  ): Promise<FixedExpense | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
