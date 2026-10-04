import type { DashboardMonthlyOverview, DashboardOverview, MonthKey } from '@finance/shared';

import { apiFetch } from '../api-client';
import { monthRange } from '../month';
import { dashboardMonthlyOverviewPath, dashboardOverviewPath } from './paths';

const TREND_MONTH_COUNT = 6;

export type DashboardData = {
  overview: DashboardOverview;
  trends: DashboardMonthlyOverview;
};

export async function fetchDashboard(month: MonthKey): Promise<DashboardData> {
  const { from, to } = monthRange(month, TREND_MONTH_COUNT);

  const [overview, trends] = await Promise.all([
    apiFetch<DashboardOverview>(dashboardOverviewPath(month)),
    apiFetch<DashboardMonthlyOverview>(dashboardMonthlyOverviewPath(from, to)),
  ]);

  return { overview, trends };
}

export { TREND_MONTH_COUNT };
