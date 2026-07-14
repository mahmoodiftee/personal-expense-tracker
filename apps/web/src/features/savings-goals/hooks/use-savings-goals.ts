'use client';

import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import type { SavingsGoalsOverview } from '@finance/shared';

import { fetchSavingsGoalsOverview } from '../api/savings-goals-api';

export const savingsGoalsQueryKey = ['savings-goals'] as const;

export function useSavingsGoalsOverview() {
  return useQuery<SavingsGoalsOverview, ApiClientError>({
    queryKey: savingsGoalsQueryKey,
    queryFn: fetchSavingsGoalsOverview,
  });
}
