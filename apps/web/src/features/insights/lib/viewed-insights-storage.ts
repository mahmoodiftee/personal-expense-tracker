export const VIEWED_INSIGHTS_STORAGE_KEY = 'finance-insights-viewed';

export function parseViewedInsightIds(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value): value is string => typeof value === 'string'));
  } catch {
    return new Set();
  }
}

export function serializeViewedInsightIds(ids: ReadonlySet<string>): string {
  return JSON.stringify([...ids]);
}
