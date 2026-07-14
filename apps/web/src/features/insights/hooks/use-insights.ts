'use client';

import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import type { Insight } from '@finance/shared';

import { fetchInsights } from '../api/insights-api';

export function insightsQueryKey(month?: MonthKey) {
  return month ? (['insights', month] as const) : (['insights'] as const);
}

export function useInsights(month?: MonthKey) {
  return useQuery<Insight[], ApiClientError>({
    queryKey: insightsQueryKey(month),
    queryFn: () => fetchInsights(month),
  });
}
