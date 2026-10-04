import type { DashboardMonthlyOverviewItem, MonthKey } from '@finance/shared';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type TrendDelta = {
  value: string;
  direction: TrendDirection;
};

/** Percent change vs prior month; neutral when prior is zero or missing. */
export function computePercentTrend(current: number, previous: number | undefined): TrendDelta {
  if (previous === undefined || previous === 0) {
    return { value: '—', direction: 'neutral' };
  }

  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const direction: TrendDirection = pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'neutral';
  const sign = pct > 0 ? '+' : '';
  return { value: `${sign}${pct.toFixed(1)}%`, direction };
}

export function findPriorMonthItem(
  months: readonly DashboardMonthlyOverviewItem[],
  monthKey: MonthKey,
): DashboardMonthlyOverviewItem | undefined {
  const index = months.findIndex((item) => item.monthKey === monthKey);
  if (index <= 0) return undefined;
  return months[index - 1];
}
