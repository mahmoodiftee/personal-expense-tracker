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
      className={cn('rounded-xl border border-border bg-card p-4', className)}
    >
      <div className="mb-4 flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCell label="Fixed paid" value={summary.fixedPaid} accent="success" />
        <SummaryCell label="Fixed unpaid" value={summary.fixedUnpaid} />
        <SummaryCell label="Variable" value={summary.variableTotal} />
        <SummaryCell label="Fixed due" value={summary.fixedDue} />
      </div>
      <Typography
        variant="caption"
        className="mt-2 block text-center text-muted-foreground md:text-left"
      >
        Remaining updates as you mark fixed bills paid · {summary.paidCount} paid ·{' '}
        {summary.unpaidCount} unpaid · {summary.variableCount} variable
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
    <div className="min-w-0">
      <Typography variant="caption" className="block truncate">
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
