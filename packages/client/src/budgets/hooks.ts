import type { Category, MonthKey, MonthlyBudgetSummary } from '@finance/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '../api-client';
import {
  createCategoryBudget,
  deleteCategoryBudget,
  fetchBudgetableCategories,
  fetchMonthlyBudgetSummary,
  updateCategoryBudget,
} from './budgets-api';
import type { BudgetFormValues } from './schemas';

export function budgetsQueryKey(month: MonthKey) {
  return ['budgets', month] as const;
}

export const budgetableCategoriesQueryKey = ['categories', 'budgetable'] as const;

export function useMonthlyBudgetSummary(month: MonthKey) {
  return useQuery<MonthlyBudgetSummary, ApiClientError>({
    queryKey: budgetsQueryKey(month),
    queryFn: () => fetchMonthlyBudgetSummary(month),
  });
}

export function useBudgetableCategories() {
  return useQuery<Category[], ApiClientError>({
    queryKey: budgetableCategoriesQueryKey,
    queryFn: fetchBudgetableCategories,
    staleTime: 60_000,
  });
}

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
