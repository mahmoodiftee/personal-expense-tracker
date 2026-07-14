import type { DashboardMonthlyOverview, DashboardOverview, MonthKey } from '@finance/shared';

import { apiFetch } from '@/lib/api-client';
import { monthRange } from '@/lib/month';

import { demoFetchOptions } from '@/lib/demo-fetch';
import { dashboardMonthlyOverviewPath, dashboardOverviewPath } from '../lib/paths';

const TREND_MONTH_COUNT = 6;

export type DashboardData = {
  overview: DashboardOverview;
  trends: DashboardMonthlyOverview;
};

export async function fetchDashboard(month: MonthKey): Promise<DashboardData> {
  const { from, to } = monthRange(month, TREND_MONTH_COUNT);
  const fetchOptions = demoFetchOptions();

  const [overview, trends] = await Promise.all([
    apiFetch<DashboardOverview>(dashboardOverviewPath(month), fetchOptions),
    apiFetch<DashboardMonthlyOverview>(dashboardMonthlyOverviewPath(from, to), fetchOptions),
  ]);

  return { overview, trends };
}

export { TREND_MONTH_COUNT };
