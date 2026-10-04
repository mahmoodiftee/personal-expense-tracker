import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '../api-client';
import { fetchDashboard, type DashboardData } from './fetch-dashboard';

export function useDashboard(month: MonthKey) {
  return useQuery<DashboardData, ApiClientError>({
    queryKey: ['dashboard', month],
    queryFn: () => fetchDashboard(month),
  });
}
