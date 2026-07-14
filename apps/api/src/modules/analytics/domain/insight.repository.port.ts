import type { Insight, InsightSeverity, InsightType, MonthKey } from '@finance/shared';

export const INSIGHT_REPOSITORY = Symbol('INSIGHT_REPOSITORY');

export interface CreateInsightData {
  readonly userId: string;
  readonly type: InsightType;
  readonly severity: InsightSeverity;
  readonly title: string;
  readonly message: string;
  readonly data?: Record<string, unknown> | null;
  readonly monthKey?: MonthKey | null;
}

export interface InsightQuery {
  readonly monthKey?: MonthKey;
  readonly limit?: number;
}

export interface InsightRepositoryPort {
  create(data: CreateInsightData): Promise<Insight>;
  /** Bulk create — insight generation jobs emit many at once. */
  createMany(data: readonly CreateInsightData[]): Promise<readonly Insight[]>;
  findMany(userId: string, query?: InsightQuery): Promise<readonly Insight[]>;
  /** Clear regenerated insights for a month before re-emitting (idempotency). */
  deleteByMonth(userId: string, monthKey: MonthKey): Promise<number>;
}
