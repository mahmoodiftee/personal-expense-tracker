import type { Money } from './money';
import type { MonthKey } from './models';
import type { CurrencyCode, ForecastMethod } from './enums';
import type { MonthlyBudgetSummary } from './budget';
import type { SavingsProjectionPoint } from './savings';

/**
 * Dashboard domain read models. The dashboard is a *composed* view over income,
 * expenses, savings, category breakdown, and forecasts — it owns no collection.
 */

/** Headline totals for a single month. */
export interface DashboardSnapshot {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly totalIncome: Money;
  readonly totalExpenses: Money;
  /** income − totalExpenses (signed; negative = overspent). */
  readonly remainingBalance: Money;
  readonly savings: {
    readonly amount: Money;
    readonly ratePct: number;
  };
  readonly expenseBreakdown: {
    readonly fixed: Money;
    readonly variable: Money;
  };
}

export interface DashboardCategoryItem {
  readonly categoryId: string;
  readonly name: string;
  readonly color: string;
  readonly total: Money;
  readonly transactionCount: number;
  readonly sharePct: number;
}

export interface DashboardForecast {
  readonly method: ForecastMethod;
  readonly confidencePct: number;
  readonly basedOnMonths: number;
  readonly nextMonth: SavingsProjectionPoint | null;
  readonly horizon: readonly SavingsProjectionPoint[];
}

/** Full dashboard payload for one month — the primary UI load. */
export interface DashboardOverview {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly snapshot: DashboardSnapshot;
  readonly categoryBreakdown: readonly DashboardCategoryItem[];
  readonly forecast: DashboardForecast;
  readonly budgetSummary: MonthlyBudgetSummary;
}

/** One month in a trend / sparkline series. */
export interface DashboardMonthlyOverviewItem {
  readonly monthKey: MonthKey;
  readonly totalIncome: Money;
  readonly totalExpenses: Money;
  readonly remainingBalance: Money;
  readonly savings: Money;
  readonly savingsRatePct: number;
}

/** Multi-month trend for charts and comparison views. */
export interface DashboardMonthlyOverview {
  readonly rangeStart: MonthKey;
  readonly rangeEnd: MonthKey;
  readonly currency: CurrencyCode;
  readonly months: readonly DashboardMonthlyOverviewItem[];
}
