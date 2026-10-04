import type {
  BudgetAnalytics,
  Category,
  CategoryBudget,
  MonthKey,
  MonthlyBudgetSummary,
} from '@finance/shared';

import { apiFetch } from '../api-client';
import {
  createVariableExpenseCategory,
  fetchVariableExpenseCategories,
} from '../categories/categories-api';
import { defaultCurrency, toAmountMinor } from '../expenses/schemas';
import type { BudgetFormValues } from './schemas';

function bodyFromForm(values: BudgetFormValues, currency = defaultCurrency) {
  return {
    month: values.month,
    categoryId: values.categoryId,
    limitAmount: toAmountMinor(values.limitAmount, currency),
  };
}

export async function fetchMonthlyBudgetSummary(month?: MonthKey): Promise<MonthlyBudgetSummary> {
  const params = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiFetch<MonthlyBudgetSummary>(`/budgets${params}`);
}

export async function fetchBudgetAnalytics(month?: MonthKey): Promise<BudgetAnalytics> {
  const params = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiFetch<BudgetAnalytics>(`/analytics/budget-status${params}`);
}

export async function fetchBudgetableCategories(): Promise<Category[]> {
  return fetchVariableExpenseCategories();
}

export async function createVariableCategory(name: string): Promise<Category> {
  return createVariableExpenseCategory(name);
}

export async function createCategoryBudget(values: BudgetFormValues): Promise<CategoryBudget> {
  return apiFetch<CategoryBudget>('/budgets', {
    method: 'POST',
    body: JSON.stringify(bodyFromForm(values)),
  });
}

export async function updateCategoryBudget(
  id: string,
  limitAmount: string,
): Promise<CategoryBudget> {
  return apiFetch<CategoryBudget>(`/budgets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      limitAmount: toAmountMinor(limitAmount, defaultCurrency),
    }),
  });
}

export async function deleteCategoryBudget(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/budgets/${id}`, {
    method: 'DELETE',
  });
}
