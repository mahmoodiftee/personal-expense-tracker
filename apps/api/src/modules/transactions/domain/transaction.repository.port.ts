import type { CategorySnapshot, Flow, Money, MonthKey, Transaction } from '@finance/shared';
import type { CursorPagination, Paginated } from '../../../common/domain/pagination';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface CreateTransactionData {
  readonly userId: string;
  readonly flow: Flow;
  readonly amount: Money;
  readonly categoryId?: string | null;
  readonly categorySnapshot: CategorySnapshot;
  readonly recurringPlanId?: string | null;
  readonly description: string;
  readonly notes?: string | null;
  readonly tags?: readonly string[];
  readonly occurredAt: Date;
}

export interface UpdateTransactionData {
  readonly amount?: Money;
  readonly categoryId?: string | null;
  readonly categorySnapshot?: CategorySnapshot;
  readonly description?: string;
  readonly notes?: string | null;
  readonly tags?: readonly string[];
  readonly occurredAt?: Date;
}

export interface TransactionFilter {
  readonly from?: Date;
  readonly to?: Date;
  readonly monthKey?: MonthKey;
  readonly flow?: Flow;
  readonly categoryId?: string;
  readonly tags?: readonly string[];
  /** Case-insensitive match against description, notes, and category name. */
  readonly search?: string;
  /** Inclusive amount bounds in minor units. */
  readonly amountMinMinor?: number;
  readonly amountMaxMinor?: number;
  /** Excludes transactions materialised from recurring plans (variable expenses only). */
  readonly adHocOnly?: boolean;
}

/** Aggregate total of a flow for a given month (drives statement rollups). */
export interface FlowTotal {
  readonly flow: Flow;
  readonly total: Money;
  readonly transactionCount: number;
}

/** Per-category aggregate for a month (drives breakdowns & AI context). */
export interface CategoryAggregate {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly color: string;
  readonly total: Money;
  readonly transactionCount: number;
}

export interface InlineCategorySnapshot {
  readonly name: string;
  readonly color: string;
  readonly icon: string;
}

export interface TransactionRepositoryPort {
  create(data: CreateTransactionData): Promise<Transaction>;
  findById(userId: string, id: string): Promise<Transaction | null>;
  update(userId: string, id: string, changes: UpdateTransactionData): Promise<Transaction | null>;
  delete(userId: string, id: string): Promise<boolean>;

  /** Cursor-paginated feed with filtering (mobile-friendly infinite scroll). */
  findManyPaginated(
    userId: string,
    filter: TransactionFilter,
    pagination: CursorPagination,
  ): Promise<Paginated<Transaction>>;

  // --- Aggregation reads (consumed by Analytics + AI) ---

  /** Totals grouped by flow for a month. */
  sumByFlowForMonth(userId: string, monthKey: MonthKey): Promise<readonly FlowTotal[]>;

  /** Totals for one flow grouped by monthKey within an inclusive range. */
  sumByFlowGroupedByMonth(
    userId: string,
    from: MonthKey,
    to: MonthKey,
    flow: Flow,
  ): Promise<ReadonlyMap<MonthKey, Money>>;

  /** Expense (or income) totals grouped by category for a month. */
  breakdownByCategory(
    userId: string,
    monthKey: MonthKey,
    flow: Flow,
  ): Promise<readonly CategoryAggregate[]>;

  /** Category breakdown for each month in an inclusive range (one aggregation). */
  breakdownByCategoryGroupedByMonth(
    userId: string,
    from: MonthKey,
    to: MonthKey,
    flow: Flow,
  ): Promise<ReadonlyMap<MonthKey, readonly CategoryAggregate[]>>;

  /** Distinct months that have activity — used to seed statement backfills. */
  distinctMonthKeys(userId: string): Promise<readonly MonthKey[]>;

  /** Inline category labels on ad-hoc expenses that are not linked to the catalogue yet. */
  distinctInlineExpenseCategorySnapshots(
    userId: string,
  ): Promise<readonly InlineCategorySnapshot[]>;

  /** Links orphan ad-hoc expenses to a catalogue category by snapshot name (case-insensitive). */
  linkInlineExpensesToCategory(
    userId: string,
    snapshotName: string,
    categoryId: string,
  ): Promise<number>;
}
