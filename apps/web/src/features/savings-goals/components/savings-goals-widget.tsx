'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';

import { useSavingsGoalsOverview } from '../hooks/use-savings-goals';
import { SavingsGoalCard } from './savings-goal-card';

const PREVIEW_LIMIT = 3;

type SavingsGoalsWidgetProps = {
  month: MonthKey;
};

export function SavingsGoalsWidget({ month }: SavingsGoalsWidgetProps) {
  const { data, isLoading, isError } = useSavingsGoalsOverview(month);
  const goals = data?.goals.slice(0, PREVIEW_LIMIT) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Savings goals</CardTitle>
          <CardDescription>Track progress toward your targets</CardDescription>
        </div>
        <Link
          href={'/savings-goals' as Route}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            Could not load savings goals.
          </Typography>
        ) : null}

        {!isLoading && !isError && goals.length === 0 ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            No goals yet. Create one to see progress here.
          </Typography>
        ) : null}

        {!isLoading && !isError
          ? goals.map((goal) => <SavingsGoalCard key={goal.id} goal={goal} compact />)
          : null}
      </CardContent>
    </Card>
  );
}
