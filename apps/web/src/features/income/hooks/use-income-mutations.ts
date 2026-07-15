'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import { currentMonthKey } from '@/lib/month';

import {
  createExtraIncome,
  createFixedIncomeSource,
  deleteExtraIncome,
  deleteFixedIncomeSource,
  updateExtraIncome,
  updateFixedIncomeSource,
} from '../api/income-api';
import type { ExtraIncomeFormValues, FixedIncomeFormValues } from '../lib/schemas';
import { extraIncomeQueryKey, fixedIncomeQueryKey } from './use-income-queries';

async function invalidateIncomeQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  month?: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: fixedIncomeQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['income', 'extra'] }),
    ...(month ? [queryClient.invalidateQueries({ queryKey: extraIncomeQueryKey(month) })] : []),
    queryClient.invalidateQueries({ queryKey: ['monthly-finance'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
  ]);
}

export function useCreateExtraIncomeMutation(month: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, ExtraIncomeFormValues>({
    mutationFn: (values) => createExtraIncome(values),
    onSettled: () => invalidateIncomeQueries(queryClient, month),
  });
}

export function useUpdateExtraIncomeMutation(month: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, { id: string; values: ExtraIncomeFormValues }>({
    mutationFn: ({ id, values }) => updateExtraIncome(id, values),
    onSettled: () => invalidateIncomeQueries(queryClient, month),
  });
}

export function useDeleteExtraIncomeMutation(month: string) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, string>({
    mutationFn: deleteExtraIncome,
    onSettled: () => invalidateIncomeQueries(queryClient, month),
  });
}

export function useCreateFixedIncomeMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, FixedIncomeFormValues>({
    mutationFn: (values) => createFixedIncomeSource(values),
    onSettled: () => invalidateIncomeQueries(queryClient),
  });
}

export function useUpdateFixedIncomeMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, { id: string; values: FixedIncomeFormValues }>({
    mutationFn: ({ id, values }) =>
      updateFixedIncomeSource(id, values, undefined, currentMonthKey()),
    onSettled: () => invalidateIncomeQueries(queryClient),
  });
}

export function useDeleteFixedIncomeMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, string>({
    mutationFn: deleteFixedIncomeSource,
    onSettled: () => invalidateIncomeQueries(queryClient),
  });
}
