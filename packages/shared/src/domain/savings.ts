import type { Money } from './money';
import type { MonthKey } from './models';
import type { CurrencyCode, ForecastMethod } from './enums';

/**
 * Savings domain read models. Savings is a *derived* quantity computed from
 * income, fixed expenses, and variable expenses — it owns no collection of its
 * own (Computed Pattern). `savings` may be negative when spending exceeds
 * income, so consumers must treat these amounts as signed.
 */

export interface MonthlySavings {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly income: Money;
  readonly fixedExpense: Money;
  readonly variableExpense: Money;
  readonly totalExpense: Money;
  /** income − totalExpense (signed). */
  readonly savings: Money;
  /** savings ÷ income × 100, rounded to 2dp (0 when there is no income). */
  readonly savingsRatePct: number;
}

export interface SavingsHistory {
  readonly rangeStart: MonthKey;
  readonly rangeEnd: MonthKey;
  readonly currency: CurrencyCode;
  readonly months: readonly MonthlySavings[];
  readonly totalSaved: Money;
  readonly averageSaved: Money;
  readonly averageRatePct: number;
  readonly bestMonth: MonthKey | null;
  readonly worstMonth: MonthKey | null;
}

export interface SavingsProjectionPoint {
  readonly monthKey: MonthKey;
  /** Forecast savings for the month (signed). */
  readonly projectedSavings: Money;
  /** Running total of projected savings across the horizon (signed). */
  readonly projectedCumulative: Money;
}

export interface SavingsProjection {
  readonly method: ForecastMethod;
  /** Number of historical months the forecast was fit on. */
  readonly basedOnMonths: number;
  readonly lookbackMonths: number;
  readonly horizonMonths: number;
  /** Model confidence 0–100 (data sufficiency × fit/stability). */
  readonly confidencePct: number;
  readonly currency: CurrencyCode;
  readonly months: readonly SavingsProjectionPoint[];
  readonly nextMonth: SavingsProjectionPoint | null;
}
