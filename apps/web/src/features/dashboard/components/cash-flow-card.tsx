'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { APP_CURRENCY } from '@/lib/currency-config';
import { formatTakaAmount } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { CHART_COLORS, formatChartCompact, formatChartCurrency } from '@/lib/chart-theme';

import type { ChartPoint } from '../types';

const SERIES = [
  { key: 'income', label: 'Income' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'savings', label: 'Savings' },
] as const;

type SeriesKey = (typeof SERIES)[number]['key'];

type CashFlowCardProps = {
  points: ChartPoint[];
  className?: string;
};

function CashFlowTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
}) {
  const value = payload?.[0]?.value;
  if (!active || typeof value !== 'number') return null;

  return (
    <div className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-raised">
      <span className="tabular-nums">{formatChartCurrency(value, APP_CURRENCY)}</span>
    </div>
  );
}

export function CashFlowCard({ points, className }: CashFlowCardProps) {
  const reducedMotion = useReducedMotion();
  const [series, setSeries] = useState<SeriesKey>('income');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = useMemo(
    () => points.reduce((sum, point) => sum + point[series], 0),
    [points, series],
  );

  // Default highlight falls on the strongest month, as in the mockup.
  const peakIndex = useMemo(() => {
    if (points.length === 0) return null;
    let best = 0;
    points.forEach((point, index) => {
      if (point[series] > points[best]![series]) best = index;
    });
    return best;
  }, [points, series]);

  const highlighted = activeIndex ?? peakIndex;

  if (points.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 md:p-5">
          <Typography variant="label" as="p">
            Cash flow
          </Typography>
          <Typography variant="body-sm">Not enough history to render a chart yet.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Typography variant="label" as="p" className="text-muted-foreground">
              Cash flow
            </Typography>
            <p className="text-2xl font-semibold tabular-nums tracking-tight md:text-3xl">
              {formatTakaAmount(total)}
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Last {points.length} months
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Cash flow series"
          className="inline-flex items-center gap-1 rounded-full bg-muted p-1"
        >
          {SERIES.map((item) => {
            const isActive = item.key === series;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setSeries(item.key);
                  setActiveIndex(null);
                }}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-card text-foreground shadow-card'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          className="h-64 w-full md:h-72"
          role="img"
          aria-label={`Bar chart of monthly ${series}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={points}
              margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatChartCompact}
                width={56}
              />
              <Tooltip
                content={<CashFlowTooltip />}
                cursor={false}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar
                dataKey={series}
                radius={[8, 8, 8, 8]}
                isAnimationActive={!reducedMotion}
                onMouseEnter={(_, index: number) => setActiveIndex(index)}
              >
                {points.map((point, index) => (
                  <Cell
                    key={point.monthKey}
                    fill={index === highlighted ? CHART_COLORS.active : CHART_COLORS.inactive}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
