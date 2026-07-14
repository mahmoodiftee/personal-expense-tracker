'use client';

import type { MonthKey } from '@finance/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import {
  createCategoryBudget,
  deleteCategoryBudget,
  updateCategoryBudget,
} from '../api/budgets-api';
import type { BudgetFormValues } from '../lib/schemas';
import { budgetsQueryKey } from './use-budgets';

async function invalidateBudgetQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  month: MonthKey,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: budgetsQueryKey(month) }),
    queryClient.invalidateQueries({ queryKey: ['dashboard', month] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
  ]);
}

export function useCreateBudgetMutation(month: MonthKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BudgetFormValues) => createCategoryBudget(values),
    onSettled: () => invalidateBudgetQueries(queryClient, month),
  });
}

export function useUpdateBudgetMutation(month: MonthKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, limitAmount }: { id: string; limitAmount: string }) =>
      updateCategoryBudget(id, limitAmount),
    onSettled: () => invalidateBudgetQueries(queryClient, month),
  });
}

export function useDeleteBudgetMutation(month: MonthKey) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, string>({
    mutationFn: deleteCategoryBudget,
    onSettled: () => invalidateBudgetQueries(queryClient, month),
  });
}
