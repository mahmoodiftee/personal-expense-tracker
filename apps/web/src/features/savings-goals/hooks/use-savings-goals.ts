'use client';

import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import type { SavingsGoalsOverview } from '@finance/shared';

import { fetchSavingsGoalsOverview } from '../api/savings-goals-api';

export function savingsGoalsQueryKey(month?: MonthKey) {
  return month ? (['savings-goals', month] as const) : (['savings-goals'] as const);
}

export function useSavingsGoalsOverview(month?: MonthKey) {
  return useQuery<SavingsGoalsOverview, ApiClientError>({
    queryKey: savingsGoalsQueryKey(month),
    queryFn: () => fetchSavingsGoalsOverview(month),
  });
}
