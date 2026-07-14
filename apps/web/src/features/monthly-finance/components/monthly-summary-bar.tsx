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
      aria-label="Monthly expense summary"
      className={cn('rounded-xl border border-border bg-card p-4', className)}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCell label="Fixed due" value={summary.fixedDue} />
        <SummaryCell label="Fixed paid" value={summary.fixedPaid} accent="success" />
        <SummaryCell label="Variable" value={summary.variableTotal} />
        <SummaryCell label="Total committed" value={summary.totalCommitted} accent="primary" />
      </div>
      <Typography
        variant="caption"
        className="mt-2 block text-center text-muted-foreground md:text-left"
      >
        {summary.paidCount} paid · {summary.unpaidCount} unpaid fixed · {summary.variableCount}{' '}
        variable
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
