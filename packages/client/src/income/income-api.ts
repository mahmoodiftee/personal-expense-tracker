import type { CurrencyCode, ExtraIncome, IncomeSource } from '@finance/shared';

import { apiFetch, apiFetchPaginated } from '../api-client';
import { defaultCurrency, toAmountMinor, toIsoFromDateInput } from '../expenses/schemas';
import type { ExtraIncomeFormValues, FixedIncomeFormValues } from './schemas';

export async function listFixedIncomeSources(): Promise<IncomeSource[]> {
  const items = await apiFetch<IncomeSource[]>('/income/sources');
  return [...items];
}

export async function listExtraIncome(month: string, limit = 100): Promise<ExtraIncome[]> {
  const page = await apiFetchPaginated<ExtraIncome>(`/extra-income?month=${month}&limit=${limit}`);
  return page.items;
}

export async function createExtraIncome(
  values: ExtraIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<ExtraIncome> {
  return apiFetch<ExtraIncome>('/extra-income', {
    method: 'POST',
    body: JSON.stringify({
      description: values.description,
      amount: toAmountMinor(values.amount, currency),
      occurredAt: toIsoFromDateInput(values.occurredOn),
      notes: values.notes || undefined,
    }),
  });
}

export async function updateExtraIncome(
  id: string,
  values: ExtraIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<ExtraIncome> {
  return apiFetch<ExtraIncome>(`/extra-income/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      description: values.description,
      amount: toAmountMinor(values.amount, currency),
      occurredAt: toIsoFromDateInput(values.occurredOn),
      notes: values.notes || null,
    }),
  });
}

export async function deleteExtraIncome(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/extra-income/${id}`, {
    method: 'DELETE',
  });
}

export async function createFixedIncomeSource(
  values: FixedIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<IncomeSource> {
  return apiFetch<IncomeSource>('/income/sources', {
    method: 'POST',
    body: JSON.stringify({
      name: values.name,
      amount: toAmountMinor(values.amount, currency),
      cadence: values.cadence,
      dueDay: values.dueDay,
      startMonth: values.startMonth,
      endMonth: values.endMonth || undefined,
    }),
  });
}

export async function updateFixedIncomeSource(
  id: string,
  values: FixedIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
  effectiveFrom?: string,
): Promise<IncomeSource> {
  const updated = await apiFetch<IncomeSource>(`/income/sources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: values.name,
      dueDay: values.dueDay,
      status: values.status,
      endMonth: values.endMonth || undefined,
    }),
  });

  await apiFetch<IncomeSource>(`/income/sources/${id}/amount`, {
    method: 'PATCH',
    body: JSON.stringify({
      amount: toAmountMinor(values.amount, currency),
      effectiveFrom: effectiveFrom ?? values.startMonth,
    }),
  });

  return updated;
}

export async function deleteFixedIncomeSource(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/income/sources/${id}`, {
    method: 'DELETE',
  });
}
