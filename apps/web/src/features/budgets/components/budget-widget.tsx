'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthlyBudgetSummary } from '@finance/shared';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { formatMoney, formatPercent } from '@/lib/format-money';

import { BudgetCard } from './budget-card';

const PREVIEW_LIMIT = 3;

type BudgetWidgetProps = {
  summary: MonthlyBudgetSummary;
};

export function BudgetWidget({ summary }: BudgetWidgetProps) {
  const categories = summary.categories.slice(0, PREVIEW_LIMIT);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Category budgets</CardTitle>
          <CardDescription>Monthly limits vs actual spending</CardDescription>
        </div>
        <Link
          href={'/budgets' as Route}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.categories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Typography variant="caption" className="text-muted-foreground">
                Total budget
              </Typography>
              <Typography variant="label" className="tabular-nums">
                {formatMoney(summary.totalBudget)}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="text-muted-foreground">
                Total actual
              </Typography>
              <Typography variant="label" className="tabular-nums">
                {formatMoney(summary.totalActual)}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="text-muted-foreground">
                Used
              </Typography>
              <Typography variant="label" className="tabular-nums">
                {formatPercent(summary.totalUsedPct, 0)}
              </Typography>
            </div>
          </div>
        ) : null}

        {categories.length === 0 ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            No budgets set for this month. Add limits to track spending by category.
          </Typography>
        ) : null}

        {categories.map((item) => (
          <BudgetCard key={item.id} item={item} compact />
        ))}
      </CardContent>
    </Card>
  );
}
