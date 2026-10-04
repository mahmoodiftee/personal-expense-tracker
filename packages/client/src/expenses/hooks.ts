import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '../api-client';
import { currentMonthKey } from '../month';
import { variableCategoriesQueryKey } from '../categories/hooks';
import {
  createFixedExpense,
  createVariableExpense,
  deleteFixedExpense,
  deleteVariableExpense,
  listFixedExpenses,
  listVariableExpenses,
  updateFixedExpense,
  updateVariableExpense,
} from './expense-api';
import type { FixedExpenseFormValues, VariableExpenseFormValues } from './schemas';

export const fixedExpensesQueryKey = ['expenses', 'fixed'] as const;
export const variableExpensesQueryKey = ['expenses', 'variable'] as const;

export function useFixedExpensesList() {
  return useQuery({
    queryKey: fixedExpensesQueryKey,
    queryFn: listFixedExpenses,
  });
}

export function useVariableExpensesList() {
  return useQuery({
    queryKey: variableExpensesQueryKey,
    queryFn: () => listVariableExpenses(),
  });
}

async function invalidateExpenseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: fixedExpensesQueryKey }),
    queryClient.invalidateQueries({ queryKey: variableExpensesQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['monthly-finance'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['categories', 'budgetable'] }),
    queryClient.invalidateQueries({ queryKey: variableCategoriesQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['loans'] }),
  ]);
}

export function useCreateVariableExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, VariableExpenseFormValues>({
    mutationFn: (values) => createVariableExpense(values),
    onSettled: () => invalidateExpenseQueries(queryClient),
  });
}

export function useUpdateVariableExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, { id: string; values: VariableExpenseFormValues }>({
    mutationFn: ({ id, values }) => updateVariableExpense(id, values),
    onSettled: () => invalidateExpenseQueries(queryClient),
  });
}

export function useDeleteVariableExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, string>({
    mutationFn: deleteVariableExpense,
    onSettled: () => invalidateExpenseQueries(queryClient),
  });
}

export function useCreateFixedExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, FixedExpenseFormValues>({
    mutationFn: (values) => createFixedExpense(values),
    onSettled: () => invalidateExpenseQueries(queryClient),
  });
}

export function useUpdateFixedExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiClientError, { id: string; values: FixedExpenseFormValues }>({
    mutationFn: ({ id, values }) => updateFixedExpense(id, values, undefined, currentMonthKey()),
    onSettled: () => invalidateExpenseQueries(queryClient),
  });
}

export function useDeleteFixedExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, string>({
    mutationFn: deleteFixedExpense,
    onSettled: () => invalidateExpenseQueries(queryClient),
  });
}
