import type { Money } from './money';
import type {
  Cadence,
  CategoryKind,
  CurrencyCode,
  Flow,
  ForecastMethod,
  InsightSeverity,
  InsightType,
  RecurringKind,
  RecurringStatus,
} from './enums';

/**
 * Read models (API responses). Plain, serialisable shapes consumed by the web
 * client and the future AI assistant. Persistence internals (`_id`, `__v`)
 * never leak past the API — the mapper strips them.
 */

/** Month bucket key, format `YYYY-MM` (e.g. "2026-07"). Used for grouping. */
export type MonthKey = string;

export interface EntityTimestamps {
  readonly createdAt: string; // ISO-8601
  readonly updatedAt: string; // ISO-8601
}

export interface UserPreferences {
  readonly locale: string;
  /** Day of month a financial month starts (1 = calendar; supports pay cycles). */
  readonly monthStartDay: number;
  readonly theme: 'dark' | 'light' | 'system';
}

export interface User extends EntityTimestamps {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly baseCurrency: CurrencyCode;
  readonly preferences: UserPreferences;
}

export interface Category extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly flow: Flow;
  readonly kind: CategoryKind;
  readonly color: string;
  readonly icon: string;
  readonly isArchived: boolean;
}

/**
 * A single effective-dated amount for a recurring plan. Editing a plan's amount
 * appends a new period and closes the previous one — history is never lost,
 * so past months remain reproducible for analytics and forecasting.
 */
export interface AmountPeriod {
  readonly amount: Money;
  readonly effectiveFrom: MonthKey; // inclusive
  readonly effectiveTo: MonthKey | null; // null = currently active
}

/** Income source or fixed expense — a definition that repeats over time. */
export interface RecurringPlan extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly kind: RecurringKind;
  /** Optional: income sources need not be categorised; fixed expenses usually are. */
  readonly categoryId: string | null;
  readonly name: string;
  readonly amountHistory: readonly AmountPeriod[];
  readonly cadence: Cadence;
  /** Day of month the amount is expected (1..31). */
  readonly dueDay: number;
  readonly status: RecurringStatus;
  readonly startMonth: MonthKey;
  readonly endMonth: MonthKey | null;
  /** Whether occurrences auto-post as transactions each period. */
  readonly autoPost: boolean;
}

/** Denormalised category snapshot embedded on a transaction for fast reads. */
export interface CategorySnapshot {
  readonly name: string;
  readonly color: string;
  readonly icon: string;
  readonly kind: CategoryKind;
}

/** An actual money movement on the ledger. */
export interface Transaction extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly flow: Flow;
  readonly amount: Money;
  readonly categoryId: string;
  readonly categorySnapshot: CategorySnapshot;
  /** Set when this transaction was materialised from a recurring plan. */
  readonly recurringPlanId: string | null;
  readonly description: string;
  readonly notes: string | null;
  readonly tags: readonly string[];
  readonly occurredAt: string; // ISO-8601 — when money actually moved
  readonly monthKey: MonthKey; // derived from occurredAt on write
}

export interface StatementCategoryBreakdown {
  readonly categoryId: string;
  readonly name: string;
  readonly total: Money;
  readonly sharePct: number;
}

export interface SavingsForecast {
  readonly projectedSavings: Money;
  readonly method: ForecastMethod;
  readonly confidencePct: number;
}

/**
 * Precomputed per-user, per-month rollup (Computed Pattern). The read source
 * for dashboard totals, historical analysis, and forecasting.
 */
export interface MonthlyStatement {
  readonly id: string;
  readonly userId: string;
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly totals: {
    readonly income: Money;
    readonly fixedExpense: Money;
    readonly variableExpense: Money;
    readonly totalExpense: Money;
    readonly remaining: Money;
  };
  readonly savings: {
    readonly amount: Money;
    readonly ratePct: number;
  };
  readonly categoryBreakdown: readonly StatementCategoryBreakdown[];
  readonly forecast: SavingsForecast | null;
  readonly computedAt: string;
  readonly version: number;
}

/** Rule-based today, LLM-generated tomorrow — one stable contract for both. */
export interface Insight extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly type: InsightType;
  readonly severity: InsightSeverity;
  readonly title: string;
  readonly message: string;
  /** Structured payload the AI/UI can act on without re-parsing prose. */
  readonly data?: Record<string, unknown>;
  readonly monthKey: MonthKey | null;
  readonly generatedAt: string;
}
