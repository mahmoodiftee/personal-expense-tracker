'use client';

import type { LoanWithProgress } from '@finance/shared';

import { Typography } from '@/components/design-system';
import { formatMoney, formatPercent } from '@/lib/format-money';

import { GoalProgressBar } from '@/features/savings-goals/components/goal-progress-bar';

type LoanDetailPanelProps = {
  loan: LoanWithProgress;
};

export function LoanDetailPanel({ loan }: LoanDetailPanelProps) {
  const { progress } = loan;
  const monthsLabel =
    progress.monthsRemaining === null
      ? 'Open-ended'
      : progress.monthsRemaining === 0
        ? 'Final month'
        : `${progress.monthsRemaining} month${progress.monthsRemaining === 1 ? '' : 's'} left`;

  return (
    <div className="space-y-4">
      <GoalProgressBar value={progress.progressPct} label="Repayment progress" />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatBlock label="Total borrowed" value={formatMoney(progress.totalTaken)} />
        <StatBlock label="Paid so far" value={formatMoney(progress.paid)} />
        <StatBlock label="Yet to pay" value={formatMoney(progress.remaining)} highlight />
        <StatBlock
          label="Monthly EMI"
          value={progress.monthlyInstallment ? formatMoney(progress.monthlyInstallment) : '—'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <Typography variant="caption" className="text-muted-foreground">
          {formatPercent(progress.progressPct, 0)} repaid
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {progress.installmentsPaid} installment{progress.installmentsPaid === 1 ? '' : 's'} paid
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {monthsLabel}
        </Typography>
        {loan.endMonth ? (
          <Typography variant="caption" className="text-muted-foreground">
            Ends {loan.endMonth}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <Typography variant="caption" className="text-muted-foreground">
        {label}
      </Typography>
      <Typography
        variant="label"
        className={`tabular-nums ${highlight ? 'text-amber-600 dark:text-amber-400' : ''}`}
      >
        {value}
      </Typography>
    </div>
  );
}
