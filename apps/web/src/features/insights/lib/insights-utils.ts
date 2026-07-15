import { InsightSeverity, type Insight, type MonthKey } from '@finance/shared';

import { TAKA_SYMBOL } from '@/lib/currency-config';

export type SeverityFilter = 'ALL' | InsightSeverity;

export const SEVERITY_FILTER_OPTIONS: readonly SeverityFilter[] = [
  'ALL',
  InsightSeverity.CRITICAL,
  InsightSeverity.WARNING,
  InsightSeverity.INFO,
  InsightSeverity.SUCCESS,
] as const;

const SEVERITY_RANK: Record<InsightSeverity, number> = {
  [InsightSeverity.CRITICAL]: 0,
  [InsightSeverity.WARNING]: 1,
  [InsightSeverity.INFO]: 2,
  [InsightSeverity.SUCCESS]: 3,
};

export function filterInsightsBySeverity(
  insights: readonly Insight[],
  filter: SeverityFilter,
): Insight[] {
  if (filter === 'ALL') return [...insights];
  return insights.filter((insight) => insight.severity === filter);
}

export function sortInsightsByPriority(insights: readonly Insight[]): Insight[] {
  return [...insights].sort((a, b) => {
    const rankDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
  });
}

export type InsightMonthGroup = {
  readonly monthKey: MonthKey | 'undated';
  readonly insights: readonly Insight[];
};

export function groupInsightsByMonth(insights: readonly Insight[]): InsightMonthGroup[] {
  const grouped = new Map<MonthKey | 'undated', Insight[]>();

  for (const insight of insights) {
    const key = insight.monthKey ?? 'undated';
    const bucket = grouped.get(key) ?? [];
    bucket.push(insight);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, items]) => ({
      monthKey,
      insights: sortInsightsByPriority(items),
    }));
}

export function countUnviewed(
  insights: readonly Insight[],
  viewedIds: ReadonlySet<string>,
): number {
  return insights.filter((insight) => !viewedIds.has(insight.id)).length;
}

/** Rewrites API currency strings (BDT 1,000.00) to use the ৳ symbol in insight copy. */
export function formatInsightMessage(message: string): string {
  return message.replace(/BDT\s*([\d,]+(?:\.\d+)?)/g, `${TAKA_SYMBOL}$1`);
}
