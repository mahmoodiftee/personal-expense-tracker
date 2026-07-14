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

import type { MonthlyComparisonPoint } from '../types';
import { AnalyticsChartTooltip } from './chart-tooltip';

type MonthlyComparisonChartProps = {
  points: MonthlyComparisonPoint[];
  className?: string;
};

export function MonthlyComparisonChart({ points, className }: MonthlyComparisonChartProps) {
  const reducedMotion = useReducedMotion();

  if (points.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Monthly comparison</CardTitle>
          <CardDescription>No monthly data for this range.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Monthly comparison</CardTitle>
        <CardDescription>Income, expenses, and savings side by side</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="h-64 w-full sm:h-72"
          role="img"
          aria-label="Grouped bar chart comparing income expenses and savings"
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
                dataKey="income"
                name="Income"
                fill={CHART_COLORS.income}
                radius={[4, 4, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill={CHART_COLORS.expenses}
                radius={[4, 4, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
              <Bar
                dataKey="savings"
                name="Savings"
                fill={CHART_COLORS.savings}
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
