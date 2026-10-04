import type { MonthKey, SavingsGoalsOverview } from '@finance/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '../api-client';
import {
  createSavingsGoal,
  deleteSavingsGoal,
  fetchSavingsGoalsOverview,
  updateSavingsGoal,
} from './savings-goals-api';
import type { SavingsGoalFormValues } from './schemas';

export function savingsGoalsQueryKey(month?: MonthKey) {
  return month ? (['savings-goals', month] as const) : (['savings-goals'] as const);
}

export function useSavingsGoalsOverview(month?: MonthKey) {
  return useQuery<SavingsGoalsOverview, ApiClientError>({
    queryKey: savingsGoalsQueryKey(month),
    queryFn: () => fetchSavingsGoalsOverview(month),
  });
}

async function invalidateGoalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
}

export function useCreateSavingsGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: SavingsGoalFormValues) => createSavingsGoal(values),
    onSettled: () => invalidateGoalQueries(queryClient),
  });
}

export function useUpdateSavingsGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: SavingsGoalFormValues }) =>
      updateSavingsGoal(id, values),
    onSettled: () => invalidateGoalQueries(queryClient),
  });
}

export function useDeleteSavingsGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, string>({
    mutationFn: deleteSavingsGoal,
    onSettled: () => invalidateGoalQueries(queryClient),
  });
}
