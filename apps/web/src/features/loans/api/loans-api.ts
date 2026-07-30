import type { LoansOverview, MonthKey } from '@finance/shared';

import { apiFetch } from '@/lib/api-client';
import { demoFetchOptions } from '@/lib/demo-fetch';

const fetchOptions = () => demoFetchOptions();

export async function fetchLoansOverview(asOf?: MonthKey): Promise<LoansOverview> {
  const params = asOf ? `?asOf=${encodeURIComponent(asOf)}` : '';
  return apiFetch<LoansOverview>(`/loans/overview${params}`, fetchOptions());
}
