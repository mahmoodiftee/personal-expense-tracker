import type {
  BudgetAnalytics,
  ForecastAnalytics,
  MonthKey,
  MonthlyTrends,
  SavingsTrends,
  SpendingTrends,
} from '@finance/shared';

import { apiFetch } from '../api-client';
import { fetchBudgetAnalytics } from '../budgets/budgets-api';
import { monthRange } from '../month';
import { analyticsForecastPath, analyticsRangePath } from './paths';

export const DEFAULT_ANALYTICS_MONTHS = 6;

export type AnalyticsData = {
  monthly: MonthlyTrends;
  savings: SavingsTrends;
  spending: SpendingTrends;
  forecast: ForecastAnalytics;
  budgetStatus: BudgetAnalytics;
};

export async function fetchAnalytics(
  toMonth: MonthKey,
  monthCount = DEFAULT_ANALYTICS_MONTHS,
): Promise<AnalyticsData> {
  const { from, to } = monthRange(toMonth, monthCount);

  const [monthly, savings, spending, forecast, budgetStatus] = await Promise.all([
    apiFetch<MonthlyTrends>(analyticsRangePath('monthly-trends', from, to)),
    apiFetch<SavingsTrends>(analyticsRangePath('savings-trends', from, to)),
    apiFetch<SpendingTrends>(analyticsRangePath('spending-trends', from, to)),
    apiFetch<ForecastAnalytics>(analyticsForecastPath(to, 6, monthCount)),
    fetchBudgetAnalytics(to),
  ]);

  return { monthly, savings, spending, forecast, budgetStatus };
}
