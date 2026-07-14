'use client';

import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import { fetchAnalytics, type AnalyticsData } from '../api/fetch-analytics';

export function analyticsQueryKey(toMonth: MonthKey, monthCount: number) {
  return ['analytics', toMonth, monthCount] as const;
}

export function useAnalytics(toMonth: MonthKey, monthCount: number) {
  return useQuery<AnalyticsData, ApiClientError>({
    queryKey: analyticsQueryKey(toMonth, monthCount),
    queryFn: () => fetchAnalytics(toMonth, monthCount),
  });
}
