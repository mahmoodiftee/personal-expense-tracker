import type { ForecastMethod, MonthKey } from '@finance/shared';

export function dashboardOverviewPath(month: MonthKey, forecastMonths = 3): string {
  const params = new URLSearchParams({ month, forecastMonths: String(forecastMonths) });
  return `/dashboard?${params.toString()}`;
}

export function dashboardMonthlyOverviewPath(from: MonthKey, to: MonthKey): string {
  const params = new URLSearchParams({ from, to });
  return `/dashboard/monthly-overview?${params.toString()}`;
}

export function formatForecastMethod(method: ForecastMethod): string {
  return method.replace(/_/g, ' ');
}
