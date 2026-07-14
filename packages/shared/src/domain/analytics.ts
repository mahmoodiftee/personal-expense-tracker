import type { Money } from './money';
import type { MonthKey } from './models';
import type { CurrencyCode, ForecastMethod } from './enums';
import type { SavingsProjection } from './savings';

/**
 * Analytics domain read models. Analytics is a *derived* layer over savings and
 * transaction aggregates — richer trend/forecast views for charts and AI context.
 */

/** Direction of change between two periods. */
export enum TrendDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  FLAT = 'FLAT',
}

export interface TrendDelta {
  readonly amountMinor: number; // signed change vs previous period
  readonly changePct: number; // percentage change (0 when previous is 0)
  readonly direction: TrendDirection;
}

export interface MonthlyTrendPoint {
  readonly monthKey: MonthKey;
  readonly income: Money;
  readonly totalExpenses: Money;
  readonly savings: Money;
  readonly savingsRatePct: number;
  /** Savings delta vs the prior month; null for the first point. */
  readonly changeFromPrevious: TrendDelta | null;
}

export interface MonthlyTrends {
  readonly rangeStart: MonthKey;
  readonly rangeEnd: MonthKey;
  readonly currency: CurrencyCode;
  readonly points: readonly MonthlyTrendPoint[];
  readonly summary: {
    readonly averageIncome: Money;
    readonly averageExpenses: Money;
    readonly averageSavings: Money;
    readonly overallDirection: TrendDirection;
  };
}

export interface SavingsTrendPoint {
  readonly monthKey: MonthKey;
  readonly savings: Money;
  readonly savingsRatePct: number;
  readonly changeFromPrevious: TrendDelta | null;
}

export interface SavingsTrends {
  readonly rangeStart: MonthKey;
  readonly rangeEnd: MonthKey;
  readonly currency: CurrencyCode;
  readonly points: readonly SavingsTrendPoint[];
  readonly totalSaved: Money;
  readonly averageSaved: Money;
  readonly averageRatePct: number;
  readonly bestMonth: MonthKey | null;
  readonly worstMonth: MonthKey | null;
  readonly trendDirection: TrendDirection;
}

export interface CategorySpendingPoint {
  readonly name: string;
  readonly color: string;
  readonly total: Money;
  readonly sharePct: number;
}

export interface SpendingTrendPoint {
  readonly monthKey: MonthKey;
  readonly fixed: Money;
  readonly variable: Money;
  readonly total: Money;
  readonly topCategories: readonly CategorySpendingPoint[];
}

export interface SpendingTrends {
  readonly rangeStart: MonthKey;
  readonly rangeEnd: MonthKey;
  readonly currency: CurrencyCode;
  readonly points: readonly SpendingTrendPoint[];
  readonly summary: {
    readonly averageFixed: Money;
    readonly averageVariable: Money;
    readonly averageTotal: Money;
    readonly fixedSharePct: number;
    readonly variableSharePct: number;
  };
}

export interface ForecastMethodComparison {
  readonly method: ForecastMethod;
  readonly nextMonthProjected: Money;
  readonly confidencePct: number;
}

/** Enriched forecast view with historical context and method comparison. */
export interface ForecastAnalytics {
  readonly asOf: MonthKey;
  readonly currency: CurrencyCode;
  readonly projection: SavingsProjection;
  readonly historicalAverage: Money;
  readonly projectedAverage: Money;
  readonly projectedTotal: Money;
  readonly trendVsHistorical: TrendDelta;
  readonly methodComparison: readonly ForecastMethodComparison[];
}
