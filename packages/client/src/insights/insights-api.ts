import type { Insight, MonthKey } from '@finance/shared';

import { apiFetch } from '../api-client';

export async function fetchInsights(month?: MonthKey, limit = 50): Promise<Insight[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (month) params.set('month', month);
  return apiFetch<Insight[]>(`/insights?${params.toString()}`);
}
