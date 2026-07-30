'use client';

import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import type { LoansOverview } from '@finance/shared';

import { fetchLoansOverview } from '../api/loans-api';

export function loansQueryKey(month?: MonthKey) {
  return month ? (['loans', month] as const) : (['loans'] as const);
}

export function useLoansOverview(month?: MonthKey) {
  return useQuery<LoansOverview, ApiClientError>({
    queryKey: loansQueryKey(month),
    queryFn: () => fetchLoansOverview(month),
  });
}
