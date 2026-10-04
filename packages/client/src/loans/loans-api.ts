import type { LoansOverview, MonthKey } from '@finance/shared';

import { apiFetch } from '../api-client';

export async function fetchLoansOverview(asOf?: MonthKey): Promise<LoansOverview> {
  const params = asOf ? `?asOf=${encodeURIComponent(asOf)}` : '';
  return apiFetch<LoansOverview>(`/loans/overview${params}`);
}
