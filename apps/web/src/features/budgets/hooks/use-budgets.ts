'use client';

import type { MonthKey } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import type { MonthlyBudgetSummary } from '@finance/shared';

import { fetchMonthlyBudgetSummary } from '../api/budgets-api';

export function budgetsQueryKey(month: MonthKey) {
  return ['budgets', month] as const;
}

export function useMonthlyBudgetSummary(month: MonthKey) {
  return useQuery<MonthlyBudgetSummary, ApiClientError>({
    queryKey: budgetsQueryKey(month),
    queryFn: () => fetchMonthlyBudgetSummary(month),
  });
}
