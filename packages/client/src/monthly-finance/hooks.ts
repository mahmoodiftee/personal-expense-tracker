import { PaymentStatus, type MonthKey } from '@finance/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '../api-client';
import { applyFixedItemPaymentUpdate, applyVariableItemPaymentUpdate } from './calculations';
import {
  fetchMonthlyFinance,
  markFixedExpensePaid,
  markFixedExpenseUnpaid,
  markVariableExpensePaid,
  markVariableExpenseUnpaid,
  type MonthlyFinanceData,
} from './monthly-finance-api';

export const monthlyFinanceQueryKey = (month: MonthKey) => ['monthly-finance', month] as const;

export function useMonthlyFinance(month: MonthKey) {
  return useQuery<MonthlyFinanceData, ApiClientError>({
    queryKey: monthlyFinanceQueryKey(month),
    queryFn: () => fetchMonthlyFinance(month),
  });
}

export function useToggleFixedPayment(month: MonthKey) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiClientError,
    { expenseId: string; isPaid: boolean },
    { previous?: MonthlyFinanceData }
  >({
    mutationFn: async ({ expenseId, isPaid }) => {
      if (isPaid) {
        await markFixedExpensePaid(expenseId, month);
      } else {
        await markFixedExpenseUnpaid(expenseId, month);
      }
    },
    onMutate: async ({ expenseId, isPaid }) => {
      await queryClient.cancelQueries({ queryKey: monthlyFinanceQueryKey(month) });
      const previous = queryClient.getQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month));

      if (previous) {
        const nextStatus = isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID;
        queryClient.setQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month), {
          ...previous,
          fixed: applyFixedItemPaymentUpdate(previous.fixed, expenseId, nextStatus),
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(monthlyFinanceQueryKey(month), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: monthlyFinanceQueryKey(month) });
      void queryClient.invalidateQueries({ queryKey: ['loans'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useToggleVariablePayment(month: MonthKey) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiClientError,
    { expenseId: string; isPaid: boolean },
    { previous?: MonthlyFinanceData }
  >({
    mutationFn: async ({ expenseId, isPaid }) => {
      if (isPaid) {
        await markVariableExpensePaid(expenseId);
      } else {
        await markVariableExpenseUnpaid(expenseId);
      }
    },
    onMutate: async ({ expenseId, isPaid }) => {
      await queryClient.cancelQueries({ queryKey: monthlyFinanceQueryKey(month) });
      const previous = queryClient.getQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month));

      if (previous) {
        const nextStatus = isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID;
        queryClient.setQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month), {
          ...previous,
          variable: applyVariableItemPaymentUpdate(previous.variable, expenseId, nextStatus),
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(monthlyFinanceQueryKey(month), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: monthlyFinanceQueryKey(month) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
