import type { CurrencyCode, ExtraIncome, IncomeSource } from '@finance/shared';

import { apiFetch, apiFetchPaginated } from '@/lib/api-client';
import { demoFetchOptions } from '@/lib/demo-fetch';

import {
  defaultCurrency,
  toAmountMinor,
  toIsoFromDateInput,
  type ExtraIncomeFormValues,
  type FixedIncomeFormValues,
} from '../lib/schemas';

const fetchOptions = () => demoFetchOptions();

export async function listFixedIncomeSources(): Promise<IncomeSource[]> {
  const items = await apiFetch<IncomeSource[]>('/income/sources', fetchOptions());
  return [...items];
}

export async function listExtraIncome(month: string, limit = 100): Promise<ExtraIncome[]> {
  const page = await apiFetchPaginated<ExtraIncome>(
    `/extra-income?month=${month}&limit=${limit}`,
    fetchOptions(),
  );
  return page.items;
}

export async function createExtraIncome(
  values: ExtraIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<ExtraIncome> {
  const body = {
    description: values.description,
    amount: toAmountMinor(values.amount, currency),
    occurredAt: toIsoFromDateInput(values.occurredOn),
    notes: values.notes || undefined,
  };

  return apiFetch<ExtraIncome>('/extra-income', {
    ...fetchOptions(),
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateExtraIncome(
  id: string,
  values: ExtraIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<ExtraIncome> {
  const body = {
    description: values.description,
    amount: toAmountMinor(values.amount, currency),
    occurredAt: toIsoFromDateInput(values.occurredOn),
    notes: values.notes || null,
  };

  return apiFetch<ExtraIncome>(`/extra-income/${id}`, {
    ...fetchOptions(),
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteExtraIncome(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/extra-income/${id}`, {
    ...fetchOptions(),
    method: 'DELETE',
  });
}

export async function createFixedIncomeSource(
  values: FixedIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<IncomeSource> {
  const body = {
    name: values.name,
    amount: toAmountMinor(values.amount, currency),
    cadence: values.cadence,
    dueDay: values.dueDay,
    startMonth: values.startMonth,
    endMonth: values.endMonth || undefined,
  };

  return apiFetch<IncomeSource>('/income/sources', {
    ...fetchOptions(),
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateFixedIncomeSource(
  id: string,
  values: FixedIncomeFormValues,
  currency: CurrencyCode = defaultCurrency,
  effectiveFrom?: string,
): Promise<IncomeSource> {
  const metadataBody = {
    name: values.name,
    dueDay: values.dueDay,
    status: values.status,
    endMonth: values.endMonth || undefined,
  };

  const updated = await apiFetch<IncomeSource>(`/income/sources/${id}`, {
    ...fetchOptions(),
    method: 'PATCH',
    body: JSON.stringify(metadataBody),
  });

  await apiFetch<IncomeSource>(`/income/sources/${id}/amount`, {
    ...fetchOptions(),
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
    ...fetchOptions(),
    method: 'DELETE',
  });
}
