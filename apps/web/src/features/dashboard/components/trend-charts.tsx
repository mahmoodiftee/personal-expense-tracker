'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

import {
  CHART_COLORS,
  CHART_MARGIN,
  formatChartCompact,
  formatChartCurrency,
} from '@/lib/chart-theme';
import { APP_CURRENCY } from '@/lib/currency-config';

import type { ChartPoint } from '../types';

type TrendChartsProps = {
  points: ChartPoint[];
  currency?: string;
  className?: string;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl bg-foreground px-3 py-2 text-background shadow-raised">
      <Typography variant="label" as="span" className="mb-1 block text-background">
        {label}
      </Typography>
      {payload.map((entry) => (
        <span key={entry.name} className="block text-xs tabular-nums text-background/80">
          {entry.name}:{' '}
          <span className="font-semibold text-background">
            {typeof entry.value === 'number'
              ? entry.name?.includes('Rate')
                ? `${entry.value.toFixed(1)}%`
                : formatChartCurrency(entry.value, APP_CURRENCY)
              : '—'}
          </span>
        </span>
      ))}
    </div>
  );
}

export function TrendCharts({ points, className }: TrendChartsProps) {
  const reducedMotion = useReducedMotion();
  const isEmpty = points.length === 0;

  if (isEmpty) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Trends</CardTitle>
          <CardDescription>Not enough history to render charts yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Income vs expenses</CardTitle>
          <CardDescription>Last {points.length} months</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="h-64 w-full"
            role="img"
            aria-label="Line chart comparing monthly income and expenses"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={CHART_MARGIN}>
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
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.muted }} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke={CHART_COLORS.income}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={!reducedMotion}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke={CHART_COLORS.expenses}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={!reducedMotion}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Savings trend</CardTitle>
          <CardDescription>Monthly savings and rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="h-64 w-full"
            role="img"
            aria-label="Bar chart showing monthly savings amounts"
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
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.muted }} />
                <Bar
                  dataKey="savings"
                  name="Savings"
                  fill={CHART_COLORS.savings}
                  radius={[8, 8, 8, 8]}
                  isAnimationActive={!reducedMotion}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
