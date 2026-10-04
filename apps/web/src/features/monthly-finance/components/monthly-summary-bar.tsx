'use client';

import { cn } from '@/lib/utils';

import { Typography } from '@/components/design-system';

import type { MonthlySummaryView } from '../types';

type MonthlySummaryBarProps = {
  summary: MonthlySummaryView;
  className?: string;
};

export function MonthlySummaryBar({ summary, className }: MonthlySummaryBarProps) {
  return (
    <aside
      aria-label="Monthly finance summary"
      className={cn('rounded-card bg-card p-4 shadow-card md:p-5', className)}
    >
      <div className="mb-4 flex flex-col gap-1 border-b border-border/40 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Typography variant="caption" className="text-muted-foreground">
            Remaining this month
          </Typography>
          <Typography
            variant="h2"
            className={cn(
              'tabular-nums',
              summary.isRemainingNegative ? 'text-destructive' : 'text-primary',
            )}
          >
            {summary.remaining}
          </Typography>
        </div>
        <Typography variant="caption" className="text-muted-foreground sm:text-right">
          Income {summary.incomeTotal} · Spent {summary.totalSpent}
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCell label="Fixed paid" value={summary.fixedPaid} accent="success" />
        <SummaryCell label="Fixed unpaid" value={summary.fixedUnpaid} />
        <SummaryCell label="Variable paid" value={summary.variablePaid} accent="success" />
        <SummaryCell label="Variable due" value={summary.variableUnpaid} />
        <SummaryCell label="Variable total" value={summary.variableTotal} />
        <SummaryCell label="Fixed due" value={summary.fixedDue} />
      </div>
      <Typography
        variant="caption"
        className="mt-3 block text-center text-muted-foreground md:text-left"
      >
        Remaining updates as you mark bills paid · {summary.paidCount} paid · {summary.unpaidCount}{' '}
        due · {summary.variableCount} variable
      </Typography>
    </aside>
  );
}

function SummaryCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'primary' | 'success';
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-muted/40 px-3 py-2.5">
      <Typography variant="caption" className="block truncate text-muted-foreground">
        {label}
      </Typography>
      <Typography
        variant="label"
        className={cn(
          'block truncate tabular-nums',
          accent === 'primary' && 'text-primary',
          accent === 'success' && 'text-success',
        )}
      >
        {value}
      </Typography>
    </div>
  );
}
