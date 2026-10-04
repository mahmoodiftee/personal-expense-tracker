'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';
import { Plus } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/design-system';
import { APP_CURRENCY } from '@/lib/currency-config';
import { formatPercent } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { templateIcon, templateLabel } from '@/features/savings-goals/lib/template-labels';
import { useSavingsGoalsOverview } from '@/features/savings-goals/hooks/use-savings-goals';

const CHIP_LIMIT = 3;

type SavingsHeroCardProps = {
  month: MonthKey;
  /** Pre-formatted savings total for the month, e.g. `৳36,000.00`. */
  savings: string;
  savingsRate: string;
  className?: string;
};

/**
 * Headline card: this month's savings alongside progress chips for the user's
 * top savings goals.
 */
export function SavingsHeroCard({ month, savings, savingsRate, className }: SavingsHeroCardProps) {
  const { data, isLoading } = useSavingsGoalsOverview(month);
  const goals = data?.goals.slice(0, CHIP_LIMIT) ?? [];

  const [whole, fraction] = savings.split('.');

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardContent className="flex flex-1 flex-col gap-5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Typography variant="label" as="p">
              Smart savings
            </Typography>
            <Typography variant="caption" className="block text-muted-foreground">
              Kept aside this month
            </Typography>
          </div>
          <Link
            href={'/savings-goals' as Route}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Add goal
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div>
          <p className="flex items-baseline gap-1.5 font-semibold tracking-tight">
            <span className="text-3xl tabular-nums md:text-4xl">{whole}</span>
            {fraction ? (
              <span className="text-xl tabular-nums text-muted-foreground md:text-2xl">
                .{fraction}
              </span>
            ) : null}
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {APP_CURRENCY}
            </span>
          </p>
          <Typography variant="caption" className="block text-muted-foreground">
            {savingsRate} of income
          </Typography>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2">
          {isLoading
            ? Array.from({ length: CHIP_LIMIT }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-2xl" />
              ))
            : null}

          {!isLoading && goals.length === 0 ? (
            <Link
              href={'/savings-goals' as Route}
              className="col-span-3 rounded-2xl bg-muted/60 px-3 py-4 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Typography variant="caption" className="text-muted-foreground">
                Create a savings goal to track progress here
              </Typography>
            </Link>
          ) : null}

          {!isLoading
            ? goals.map((goal) => {
                const Icon = templateIcon(goal.template);
                return (
                  <Link
                    key={goal.id}
                    href={'/savings-goals' as Route}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-muted/60 px-2 py-3 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title={`${goal.name} — ${formatPercent(goal.progress.progressPct, 0)} complete`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground shadow-card">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="w-full truncate text-xs font-medium">
                      {goal.name || templateLabel(goal.template)}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {formatPercent(goal.progress.progressPct, 0)}
                    </span>
                  </Link>
                );
              })
            : null}
        </div>
      </CardContent>
    </Card>
  );
}
