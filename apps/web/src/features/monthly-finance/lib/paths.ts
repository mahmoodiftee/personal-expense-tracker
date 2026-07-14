import type { MonthKey } from '@finance/shared';

export function fixedExpensesMonthlyPath(month: MonthKey): string {
  return `/fixed-expenses/monthly?month=${encodeURIComponent(month)}`;
}

export function fixedExpensePayPath(id: string): string {
  return `/fixed-expenses/${id}/pay`;
}

export function fixedExpenseUnpayPath(id: string): string {
  return `/fixed-expenses/${id}/unpay`;
}

export function variableExpensesPath(month: MonthKey, limit = 100): string {
  const params = new URLSearchParams({ month, limit: String(limit) });
  return `/variable-expenses?${params.toString()}`;
}

export function variableExpensePath(id: string): string {
  return `/variable-expenses/${id}`;
}
