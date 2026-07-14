'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

import type { DashboardViewModel } from '../types';

type CategoryBreakdownProps = {
  items: DashboardViewModel['categoryBreakdown'];
};

export function CategoryBreakdown({ items }: CategoryBreakdownProps) {
  const reducedMotion = useReducedMotion();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by category</CardTitle>
          <CardDescription>No variable expenses recorded this month.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by category</CardTitle>
        <CardDescription>Variable expense distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div
            className="mx-auto h-56 w-full max-w-xs"
            role="img"
            aria-label="Pie chart of spending by category"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="sharePct"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                  isAnimationActive={!reducedMotion}
                >
                  {items.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name, props) => [
                    `${value.toFixed(1)}%`,
                    (props.payload as { name: string }).name,
                  ]}
                  contentStyle={{
                    background: 'hsl(0 0% 12%)',
                    border: '1px solid hsl(0 0% 18%)',
                    borderRadius: '0.75rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-3" aria-label="Category breakdown list">
            {items.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <Typography variant="body-sm">{item.name}</Typography>
                </div>
                <Typography variant="label" className="tabular-nums">
                  {item.total}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
