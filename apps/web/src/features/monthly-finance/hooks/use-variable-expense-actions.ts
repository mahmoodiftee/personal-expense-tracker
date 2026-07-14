'use client';

import type { MonthKey, VariableExpense } from '@finance/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import {
  createVariableExpense,
  deleteVariableExpense,
  type CreateVariableExpenseInput,
  type MonthlyFinanceData,
} from '../api/monthly-finance-api';
import { monthlyFinanceQueryKey } from './use-monthly-finance';

export function useCreateVariableExpense(month: MonthKey) {
  const queryClient = useQueryClient();

  return useMutation<VariableExpense, ApiClientError, CreateVariableExpenseInput>({
    mutationFn: createVariableExpense,
    onSuccess: (created) => {
      queryClient.setQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month), (previous) => {
        if (!previous) return previous;
        return { ...previous, variable: [created, ...previous.variable] };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: monthlyFinanceQueryKey(month) });
    },
  });
}

export function useDeleteVariableExpense(month: MonthKey) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiClientError, string, { previous?: MonthlyFinanceData }>({
    mutationFn: deleteVariableExpense,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: monthlyFinanceQueryKey(month) });
      const previous = queryClient.getQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month));

      if (previous) {
        queryClient.setQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month), {
          ...previous,
          variable: previous.variable.filter((item) => item.id !== id),
        });
      }

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(monthlyFinanceQueryKey(month), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: monthlyFinanceQueryKey(month) });
    },
  });
}
