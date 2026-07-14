import { describe, expect, it } from 'vitest';
import { InsightSeverity, InsightType, type Insight } from '@finance/shared';

import {
  countUnviewed,
  filterInsightsBySeverity,
  groupInsightsByMonth,
  sortInsightsByPriority,
} from './insights-utils';
import { parseViewedInsightIds, serializeViewedInsightIds } from './viewed-insights-storage';

function insight(partial: Partial<Insight> & Pick<Insight, 'id' | 'severity' | 'title'>): Insight {
  return {
    userId: 'user-1',
    type: InsightType.SPENDING_SPIKE,
    message: 'Example insight message',
    monthKey: '2026-07',
    generatedAt: '2026-07-15T12:00:00.000Z',
    createdAt: '2026-07-15T12:00:00.000Z',
    updatedAt: '2026-07-15T12:00:00.000Z',
    ...partial,
  };
}

describe('insights-utils', () => {
  const sample: Insight[] = [
    insight({ id: '1', severity: InsightSeverity.INFO, title: 'Info insight' }),
    insight({ id: '2', severity: InsightSeverity.WARNING, title: 'Warning insight' }),
    insight({
      id: '3',
      severity: InsightSeverity.CRITICAL,
      title: 'Critical insight',
      generatedAt: '2026-07-16T12:00:00.000Z',
    }),
    insight({
      id: '4',
      severity: InsightSeverity.SUCCESS,
      title: 'Success insight',
      monthKey: '2026-06',
    }),
  ];

  it('filters insights by severity', () => {
    const filtered = filterInsightsBySeverity(sample, InsightSeverity.WARNING);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('2');
  });

  it('sorts insights by severity priority then recency', () => {
    const sorted = sortInsightsByPriority(sample.filter((item) => item.monthKey === '2026-07'));
    expect(sorted.map((item) => item.id)).toEqual(['3', '2', '1']);
  });

  it('groups insights by month in descending order', () => {
    const groups = groupInsightsByMonth(sample);
    expect(groups.map((group) => group.monthKey)).toEqual(['2026-07', '2026-06']);
    expect(groups[0]?.insights).toHaveLength(3);
    expect(groups[1]?.insights).toHaveLength(1);
  });

  it('counts unviewed insights', () => {
    expect(countUnviewed(sample, new Set(['1', '3']))).toBe(2);
  });
});

describe('viewed-insights-storage', () => {
  it('round-trips viewed insight ids', () => {
    const ids = new Set(['a', 'b']);
    const parsed = parseViewedInsightIds(serializeViewedInsightIds(ids));
    expect([...parsed]).toEqual(['a', 'b']);
  });

  it('returns empty set for invalid storage payloads', () => {
    expect(parseViewedInsightIds('not-json').size).toBe(0);
    expect(parseViewedInsightIds('{"bad":true}').size).toBe(0);
  });
});
