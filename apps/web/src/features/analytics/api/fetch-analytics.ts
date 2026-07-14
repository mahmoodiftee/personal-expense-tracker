import type {
  ForecastAnalytics,
  MonthKey,
  MonthlyTrends,
  SavingsTrends,
  SpendingTrends,
} from '@finance/shared';

import { apiFetch } from '@/lib/api-client';
import { demoFetchOptions } from '@/lib/demo-fetch';
import { monthRange } from '@/lib/month';

import { analyticsForecastPath, analyticsRangePath } from '../lib/paths';

export const DEFAULT_ANALYTICS_MONTHS = 6;

export type AnalyticsData = {
  monthly: MonthlyTrends;
  savings: SavingsTrends;
  spending: SpendingTrends;
  forecast: ForecastAnalytics;
};

export async function fetchAnalytics(
  toMonth: MonthKey,
  monthCount = DEFAULT_ANALYTICS_MONTHS,
): Promise<AnalyticsData> {
  const { from, to } = monthRange(toMonth, monthCount);
  const fetchOptions = demoFetchOptions();

  const [monthly, savings, spending, forecast] = await Promise.all([
    apiFetch<MonthlyTrends>(analyticsRangePath('monthly-trends', from, to), fetchOptions),
    apiFetch<SavingsTrends>(analyticsRangePath('savings-trends', from, to), fetchOptions),
    apiFetch<SpendingTrends>(analyticsRangePath('spending-trends', from, to), fetchOptions),
    apiFetch<ForecastAnalytics>(analyticsForecastPath(to, 6, monthCount), fetchOptions),
  ]);

  return { monthly, savings, spending, forecast };
}
