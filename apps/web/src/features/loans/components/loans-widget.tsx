'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';
import { useState } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import { useLoansOverview } from '../hooks/use-loans';
import { LoanDetailPanel } from './loan-detail-panel';

type LoansWidgetProps = {
  month: MonthKey;
};

export function LoansWidget({ month }: LoansWidgetProps) {
  const { data, isLoading, isError } = useLoansOverview(month);
  const loans = data?.loans ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedId =
    activeId && loans.some((loan) => loan.id === activeId) ? activeId : loans[0]?.id;
  const selectedLoan = loans.find((loan) => loan.id === selectedId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Bank loans</CardTitle>
          <CardDescription>Track principal, payments, and months remaining</CardDescription>
        </div>
        <Link
          href={'/expenses' as Route}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        ) : null}

        {isError ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            Could not load loan tracking.
          </Typography>
        ) : null}

        {!isLoading && !isError && loans.length === 0 ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            No bank loans yet. Add a fixed expense and mark it as a bank loan with the total amount
            borrowed and monthly EMI.
          </Typography>
        ) : null}

        {!isLoading && !isError && loans.length > 0 ? (
          <>
            <div
              role="tablist"
              aria-label="Bank loans"
              className="flex flex-wrap gap-2 border-b border-border/60 pb-3"
            >
              {loans.map((loan) => {
                const isActive = loan.id === selectedId;
                return (
                  <button
                    key={loan.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    onClick={() => setActiveId(loan.id)}
                  >
                    {loan.name}
                  </button>
                );
              })}
            </div>

            {selectedLoan ? (
              <div role="tabpanel" aria-label={selectedLoan.name}>
                <LoanDetailPanel loan={selectedLoan} />
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
