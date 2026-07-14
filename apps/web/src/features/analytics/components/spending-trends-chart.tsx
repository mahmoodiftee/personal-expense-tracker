'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { CHART_COLORS, CHART_MARGIN, formatChartCompact } from '@/lib/chart-theme';

import type { SpendingChartPoint } from '../types';
import { AnalyticsChartTooltip } from './chart-tooltip';

type SpendingTrendsChartProps = {
  points: SpendingChartPoint[];
  className?: string;
};

export function SpendingTrendsChart({ points, className }: SpendingTrendsChartProps) {
  const reducedMotion = useReducedMotion();

  if (points.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spending trends</CardTitle>
          <CardDescription>No spending data for this range.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spending trends</CardTitle>
        <CardDescription>Fixed vs variable spending by month</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="h-64 w-full sm:h-72"
          role="img"
          aria-label="Stacked bar chart of fixed and variable spending"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={CHART_MARGIN}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
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
              />
              <Tooltip content={<AnalyticsChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.muted }} />
              <Bar
                dataKey="fixed"
                name="Fixed"
                stackId="spend"
                fill={CHART_COLORS.fixed}
                radius={[0, 0, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
              <Bar
                dataKey="variable"
                name="Variable"
                stackId="spend"
                fill={CHART_COLORS.variable}
                radius={[4, 4, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
