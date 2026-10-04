import type { ExtraIncome, IncomeSource } from '@finance/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '../api-client';
import { currentMonthKey } from '../month';
import {
  createExtraIncome,
  createFixedIncomeSource,
  deleteExtraIncome,
  deleteFixedIncomeSource,
  listExtraIncome,
  listFixedIncomeSources,
  updateExtraIncome,
  updateFixedIncomeSource,
} from './income-api';
import type { ExtraIncomeFormValues, FixedIncomeFormValues } from './schemas';

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
