import type { MonthKey } from '@finance/shared';

export function analyticsRangePath(
  endpoint: 'monthly-trends' | 'savings-trends' | 'spending-trends',
  from: MonthKey,
  to: MonthKey,
): string {
  const params = new URLSearchParams({ from, to });
  return `/analytics/${endpoint}?${params.toString()}`;
}

export function analyticsForecastPath(asOf: MonthKey, months = 6, lookback = 12): string {
  const params = new URLSearchParams({
    asOf,
    months: String(months),
    lookback: String(lookback),
  });
  return `/analytics/forecast?${params.toString()}`;
}
