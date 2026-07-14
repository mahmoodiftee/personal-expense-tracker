import type { Cadence, IncomeSource, Money, MonthKey, RecurringStatus } from '@finance/shared';

/** DI token binding the port to its Mongoose adapter. */
export const INCOME_SOURCE_REPOSITORY = Symbol('INCOME_SOURCE_REPOSITORY');

export interface CreateIncomeSourceData {
  readonly userId: string;
  readonly name: string;
  readonly amount: Money;
  readonly cadence: Cadence;
  readonly dueDay: number;
  readonly startMonth: MonthKey;
  readonly endMonth?: MonthKey | null;
  readonly categoryId?: string | null;
}

export interface UpdateIncomeSourceData {
  readonly name?: string;
  readonly dueDay?: number;
  readonly status?: RecurringStatus;
  readonly endMonth?: MonthKey | null;
  readonly categoryId?: string | null;
}

export interface IncomeSourceQuery {
  readonly status?: RecurringStatus;
}

/**
 * Persistence contract for income sources (recurring plans of `kind = INCOME`).
 * The application layer depends only on this port; the Mongoose adapter is
 * bound via {@link INCOME_SOURCE_REPOSITORY} (Dependency Inversion).
 */
export interface IncomeSourceRepositoryPort {
  create(data: CreateIncomeSourceData): Promise<IncomeSource>;
  findById(userId: string, id: string): Promise<IncomeSource | null>;
  findMany(userId: string, query?: IncomeSourceQuery): Promise<readonly IncomeSource[]>;
  /** Sources active (status + start/end window) during the given month. */
  findActiveInMonth(userId: string, monthKey: MonthKey): Promise<readonly IncomeSource[]>;
  /** Update mutable metadata (not the amount — see {@link appendAmount}). */
  updateMeta(
    userId: string,
    id: string,
    changes: UpdateIncomeSourceData,
  ): Promise<IncomeSource | null>;
  /**
   * Change the amount by appending a new effective-dated period (history is
   * preserved), closing the currently-open period the month before.
   */
  appendAmount(
    userId: string,
    id: string,
    amount: Money,
    effectiveFrom: MonthKey,
  ): Promise<IncomeSource | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
