'use client';

import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import { fetchMonthlyFinance, type MonthlyFinanceData } from '../api/monthly-finance-api';

export const monthlyFinanceQueryKey = (month: MonthKey) => ['monthly-finance', month] as const;

export function useMonthlyFinance(month: MonthKey) {
  return useQuery<MonthlyFinanceData, ApiClientError>({
    queryKey: monthlyFinanceQueryKey(month),
    queryFn: () => fetchMonthlyFinance(month),
  });
}
