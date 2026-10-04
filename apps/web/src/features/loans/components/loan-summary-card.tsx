'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';
import { Landmark } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/design-system';
import { formatMoney, formatPercent } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { useLoansOverview } from '../hooks/use-loans';

type LoanSummaryCardProps = {
  month: MonthKey;
  className?: string;
};

/**
 * Compact loan repayment card for the dashboard sidebar: a dark "statement"
 * panel showing EMI progress for the selected loan.
 */
export function LoanSummaryCard({ month, className }: LoanSummaryCardProps) {
  const { data, isLoading, isError } = useLoansOverview(month);
  const loans = data?.loans ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedId =
    activeId && loans.some((loan) => loan.id === activeId) ? activeId : loans[0]?.id;
  const loan = loans.find((item) => item.id === selectedId);

  if (isLoading) {
    return <Skeleton className={cn('h-52 rounded-card', className)} />;
  }

  if (isError || loans.length === 0 || !loan) {
    return (
      <Card className={className}>
        <CardContent className="space-y-2 p-4 md:p-5">
          <Typography variant="label" as="p">
            Bank loans
          </Typography>
          <Typography variant="body-sm">
            {isError
              ? 'Could not load loan tracking.'
              : 'No bank loans yet. Mark a fixed expense as a bank loan to track EMI progress here.'}
          </Typography>
          <Link
            href={'/expenses' as Route}
            className="inline-block text-xs font-medium text-foreground underline underline-offset-4"
          >
            Manage fixed expenses
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { progress } = loan;
  const monthsLabel =
    progress.monthsRemaining === null
      ? 'Open-ended'
      : progress.monthsRemaining === 0
        ? 'Final month'
        : `${progress.monthsRemaining} months left`;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="rounded-card bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 p-5 text-neutral-100 shadow-raised">
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            aria-hidden="true"
          >
            <Landmark className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {monthsLabel}
          </span>
        </div>

        <p className="mt-5 text-xs uppercase tracking-wider text-neutral-400">{loan.name}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
          {formatMoney(progress.remaining)}
        </p>
        <p className="text-xs text-neutral-400">
          outstanding of {formatMoney(progress.totalTaken)}
        </p>

        <div
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-valuenow={progress.progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${loan.name} repayment progress`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress.progressPct))}%` }}
          />
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-400">Monthly EMI</p>
            <p className="text-sm font-semibold tabular-nums">
              {progress.monthlyInstallment ? formatMoney(progress.monthlyInstallment) : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400">Repaid</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatPercent(progress.progressPct, 0)}
            </p>
          </div>
        </div>
      </div>
      {loans.length > 1 ? (
        <div className="relative">
          <div
            role="tablist"
            aria-label="Bank loans"
            className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loans.map((item) => {
              const isActive = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'bg-card text-muted-foreground shadow-card hover:text-foreground',
                  )}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
          />
        </div>
      ) : null}
    </div>
  );
}
