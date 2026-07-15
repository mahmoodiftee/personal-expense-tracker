'use client';

import type { ExtraIncome, IncomeSource } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import { listExtraIncome, listFixedIncomeSources } from '../api/income-api';

export const fixedIncomeQueryKey = ['income', 'fixed'] as const;

export function extraIncomeQueryKey(month: string) {
  return ['income', 'extra', month] as const;
}

export function useFixedIncomeList() {
  return useQuery<IncomeSource[], ApiClientError>({
    queryKey: fixedIncomeQueryKey,
    queryFn: listFixedIncomeSources,
  });
}

export function useExtraIncomeList(month: string) {
  return useQuery<ExtraIncome[], ApiClientError>({
    queryKey: extraIncomeQueryKey(month),
    queryFn: () => listExtraIncome(month),
  });
}
