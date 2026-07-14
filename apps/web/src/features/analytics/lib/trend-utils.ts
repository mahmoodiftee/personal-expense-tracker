import { TrendDirection } from '@finance/shared';

import type { MetricCardTrend } from '@/features/dashboard/types';

export function trendDirectionToMetric(direction: TrendDirection): MetricCardTrend['direction'] {
  switch (direction) {
    case TrendDirection.UP:
      return 'up';
    case TrendDirection.DOWN:
      return 'down';
    default:
      return 'neutral';
  }
}

export function formatTrendPct(changePct: number): string {
  if (changePct === 0) return '0%';
  const sign = changePct > 0 ? '+' : '';
  return `${sign}${changePct.toFixed(1)}%`;
}
