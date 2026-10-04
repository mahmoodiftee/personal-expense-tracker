import type { MonthKey, SavingsGoalsOverview, SavingsGoalWithProgress } from '@finance/shared';

import { apiFetch } from '../api-client';
import { defaultCurrency, toAmountMinor } from '../expenses/schemas';
import type { SavingsGoalFormValues } from './schemas';

function bodyFromForm(values: SavingsGoalFormValues, currency = defaultCurrency) {
  return {
    template: values.template,
    ...(values.name?.trim() ? { name: values.name.trim() } : {}),
    targetAmount: toAmountMinor(values.targetAmount, currency),
    currentAmount: toAmountMinor(values.currentAmount || '0', currency),
    ...(values.targetDate
      ? { targetDate: new Date(`${values.targetDate}T12:00:00`).toISOString() }
      : {}),
    ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
  };
}

export async function fetchSavingsGoalsOverview(asOf?: MonthKey): Promise<SavingsGoalsOverview> {
  const params = asOf ? `?asOf=${encodeURIComponent(asOf)}` : '';
  return apiFetch<SavingsGoalsOverview>(`/savings-goals${params}`);
}

export async function createSavingsGoal(
  values: SavingsGoalFormValues,
): Promise<SavingsGoalWithProgress> {
  return apiFetch<SavingsGoalWithProgress>('/savings-goals', {
    method: 'POST',
    body: JSON.stringify(bodyFromForm(values)),
  });
}

export async function updateSavingsGoal(
  id: string,
  values: SavingsGoalFormValues,
): Promise<SavingsGoalWithProgress> {
  return apiFetch<SavingsGoalWithProgress>(`/savings-goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bodyFromForm(values)),
  });
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/savings-goals/${id}`, {
    method: 'DELETE',
  });
}
