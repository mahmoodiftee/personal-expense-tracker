'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import { currentMonthKey } from '@/lib/month';

import {
  createFixedExpense,
  createVariableExpense,
  deleteFixedExpense,
  deleteVariableExpense,
  updateFixedExpense,
  updateVariableExpense,
} from '../api/expense-api';
import type { FixedExpenseFormValues, VariableExpenseFormValues } from '../lib/schemas';
import { fixedExpensesQueryKey, variableExpensesQueryKey } from './use-expense-queries';

async function invalidateExpenseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: fixedExpensesQueryKey }),
    queryClient.invalidateQueries({ queryKey: variableExpensesQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['monthly-finance'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['categories', 'budgetable'] }),
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
