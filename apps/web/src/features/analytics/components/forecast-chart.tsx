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

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { CHART_COLORS, CHART_MARGIN, formatChartCompact } from '@/lib/chart-theme';

import type { ForecastChartPoint } from '../types';
import { AnalyticsChartTooltip } from './chart-tooltip';

type ForecastChartProps = {
  points: ForecastChartPoint[];
  confidence: string;
  method: string;
  methodComparison: Array<{ method: string; amount: string; confidence: string }>;
  className?: string;
};

export function ForecastChart({
  points,
  confidence,
  method,
  methodComparison,
  className,
}: ForecastChartProps) {
  const reducedMotion = useReducedMotion();

  if (points.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Forecast</CardTitle>
          <CardDescription>Not enough history to generate a forecast.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>Forecast</CardTitle>
            <CardDescription>
              Projected savings over the next {points.length} months
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{confidence} confidence</Badge>
            <Badge variant="outline">{method}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="h-64 w-full sm:h-72"
          role="img"
          aria-label="Forecast chart of projected and cumulative savings"
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
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatChartCompact}
              />
              <Tooltip content={<AnalyticsChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.muted }} />
              <Bar
                dataKey="projected"
                name="Projected"
                fill={CHART_COLORS.forecast}
                radius={[4, 4, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke={CHART_COLORS.income}
                strokeWidth={2}
                dot={false}
                isAnimationActive={!reducedMotion}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {methodComparison.length > 0 ? (
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <Typography variant="label" className="mb-2 block">
              Method comparison (next month)
            </Typography>
            <ul className="space-y-2">
              {methodComparison.map((item) => (
                <li key={item.method} className="flex items-center justify-between gap-2 text-sm">
                  <Typography variant="body-sm">{item.method}</Typography>
                  <div className="flex items-center gap-2">
                    <Typography variant="label" className="tabular-nums">
                      {item.amount}
                    </Typography>
                    <Badge variant="secondary">{item.confidence}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
