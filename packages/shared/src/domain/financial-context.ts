import type { ForecastAnalytics, MonthlyTrends } from './analytics';
import type { DashboardCategoryItem, DashboardSnapshot } from './dashboard';
import type { MonthlyExpenseStatus } from './expense';
import type { MonthKey } from './models';
import type { CurrencyCode } from './enums';

/**
 * Composed financial read model for dashboards, analytics overview, and future
 * AI tool context. Aggregates existing derived views — no persistence of its own.
 */
export interface FinancialContext {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly snapshot: DashboardSnapshot;
  readonly trends: MonthlyTrends;
  readonly forecast: ForecastAnalytics;
  readonly unpaidBills: MonthlyExpenseStatus;
  readonly topCategories: readonly DashboardCategoryItem[];
}
