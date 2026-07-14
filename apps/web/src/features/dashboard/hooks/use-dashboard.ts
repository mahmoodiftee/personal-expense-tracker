'use client';

import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import type { DashboardData } from '../api/fetch-dashboard';
import { fetchDashboard } from '../api/fetch-dashboard';

export function useDashboard(month: MonthKey) {
  return useQuery<DashboardData, ApiClientError>({
    queryKey: ['dashboard', month],
    queryFn: () => fetchDashboard(month),
  });
}
