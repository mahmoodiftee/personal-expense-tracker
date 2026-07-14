'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { formatMoney, formatPercent } from '@/lib/format-money';

import { useMonthlyBudgetSummary } from '../hooks/use-budgets';
import { BudgetCard } from './budget-card';

const PREVIEW_LIMIT = 3;

type BudgetWidgetProps = {
  month: MonthKey;
};

export function BudgetWidget({ month }: BudgetWidgetProps) {
  const { data, isLoading, isError } = useMonthlyBudgetSummary(month);
  const categories = data?.categories.slice(0, PREVIEW_LIMIT) ?? [];

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
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            Could not load budgets.
          </Typography>
        ) : null}

        {!isLoading && !isError && data && data.categories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Typography variant="caption" className="text-muted-foreground">
                Total budget
              </Typography>
              <Typography variant="label" className="tabular-nums">
                {formatMoney(data.totalBudget)}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="text-muted-foreground">
                Total actual
              </Typography>
              <Typography variant="label" className="tabular-nums">
                {formatMoney(data.totalActual)}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="text-muted-foreground">
                Used
              </Typography>
              <Typography variant="label" className="tabular-nums">
                {formatPercent(data.totalUsedPct, 0)}
              </Typography>
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && categories.length === 0 ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            No budgets set for this month. Add limits to track spending by category.
          </Typography>
        ) : null}

        {!isLoading && !isError
          ? categories.map((item) => <BudgetCard key={item.id} item={item} compact />)
          : null}
      </CardContent>
    </Card>
  );
}
