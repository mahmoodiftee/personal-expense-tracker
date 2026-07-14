'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { CHART_COLORS, CHART_MARGIN, formatChartCompact } from '@/lib/chart-theme';

import type { SavingsChartPoint } from '../types';
import { AnalyticsChartTooltip } from './chart-tooltip';

type SavingsTrendsChartProps = {
  points: SavingsChartPoint[];
  className?: string;
};

export function SavingsTrendsChart({ points, className }: SavingsTrendsChartProps) {
  const reducedMotion = useReducedMotion();

  if (points.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Savings trends</CardTitle>
          <CardDescription>No savings data for this range.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Savings trends</CardTitle>
        <CardDescription>Monthly savings amount and savings rate</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="h-64 w-full sm:h-72"
          role="img"
          aria-label="Chart of monthly savings and savings rate"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={CHART_MARGIN}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatChartCompact}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                content={
                  <AnalyticsChartTooltip
                    valueFormatter={(value, name) =>
                      name?.includes('Rate') ? `${value.toFixed(1)}%` : formatChartCompact(value)
                    }
                  />
                }
              />
              <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.muted }} />
              <Bar
                yAxisId="left"
                dataKey="savings"
                name="Savings"
                fill={CHART_COLORS.savings}
                radius={[4, 4, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="savingsRatePct"
                name="Savings rate"
                stroke={CHART_COLORS.savingsRate}
                strokeWidth={2}
                dot={false}
                isAnimationActive={!reducedMotion}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
