import type { MonthKey, MonthlyStatement } from '@finance/shared';

export const MONTHLY_STATEMENT_REPOSITORY = Symbol('MONTHLY_STATEMENT_REPOSITORY');

/**
 * Data required to (re)compute and persist a statement. Repositories upsert on
 * (`userId`, `monthKey`) so recomputation is idempotent.
 */
export type UpsertStatementData = Omit<MonthlyStatement, 'id'>;

export interface MonthlyStatementRepositoryPort {
  /** Idempotent create-or-replace keyed by (userId, monthKey). */
  upsert(data: UpsertStatementData): Promise<MonthlyStatement>;

  findByMonth(userId: string, monthKey: MonthKey): Promise<MonthlyStatement | null>;

  /** Inclusive range, ascending by month — powers history & forecasting. */
  findRange(userId: string, from: MonthKey, to: MonthKey): Promise<readonly MonthlyStatement[]>;

  /** Most recent N statements (used as the forecasting input window). */
  findLatest(userId: string, limit: number): Promise<readonly MonthlyStatement[]>;
}
