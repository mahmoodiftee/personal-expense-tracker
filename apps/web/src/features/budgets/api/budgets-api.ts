import type {
  BudgetAnalytics,
  Category,
  CategoryBudget,
  MonthKey,
  MonthlyBudgetSummary,
} from '@finance/shared';
import { CategoryKind, Flow } from '@finance/shared';

import { apiFetch } from '@/lib/api-client';
import { demoFetchOptions } from '@/lib/demo-fetch';

import { defaultCurrency, toAmountMinor, type BudgetFormValues } from '../lib/schemas';

const fetchOptions = () => demoFetchOptions();

function bodyFromForm(values: BudgetFormValues, currency = defaultCurrency) {
  return {
    month: values.month,
    categoryId: values.categoryId,
    limitAmount: toAmountMinor(values.limitAmount, currency),
  };
}

export async function fetchMonthlyBudgetSummary(month?: MonthKey): Promise<MonthlyBudgetSummary> {
  const params = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiFetch<MonthlyBudgetSummary>(`/budgets${params}`, fetchOptions());
}

export async function fetchBudgetAnalytics(month?: MonthKey): Promise<BudgetAnalytics> {
  const params = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiFetch<BudgetAnalytics>(`/analytics/budget-status${params}`, fetchOptions());
}

export async function fetchBudgetableCategories(): Promise<Category[]> {
  const params = new URLSearchParams({
    flow: Flow.EXPENSE,
    kind: CategoryKind.VARIABLE,
  });
  return apiFetch<Category[]>(`/categories?${params.toString()}`, fetchOptions());
}

export async function createCategoryBudget(values: BudgetFormValues): Promise<CategoryBudget> {
  return apiFetch<CategoryBudget>('/budgets', {
    ...fetchOptions(),
    method: 'POST',
    body: JSON.stringify(bodyFromForm(values)),
  });
}

export async function updateCategoryBudget(
  id: string,
  limitAmount: string,
): Promise<CategoryBudget> {
  return apiFetch<CategoryBudget>(`/budgets/${id}`, {
    ...fetchOptions(),
    method: 'PATCH',
    body: JSON.stringify({
      limitAmount: toAmountMinor(limitAmount, defaultCurrency),
    }),
  });
}

export async function deleteCategoryBudget(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/budgets/${id}`, {
    ...fetchOptions(),
    method: 'DELETE',
  });
}
