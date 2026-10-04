'use client';

import type { SavingsGoalWithProgress } from '@finance/shared';
import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { formatMoney, formatPercent } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { formatEstimatedCompletion } from '../lib/form-mappers';
import { templateIcon } from '../lib/template-labels';
import { GoalProgressBar } from './goal-progress-bar';

type SavingsGoalCardProps = {
  goal: SavingsGoalWithProgress;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SavingsGoalCard({ goal, compact, onEdit, onDelete }: SavingsGoalCardProps) {
  const Icon = templateIcon(goal.template);
  const etaLabel = formatEstimatedCompletion(goal);

  if (compact) {
    return (
      <div className="space-y-3 rounded-2xl bg-muted/60 p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{goal.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground tabular-nums">
              {formatMoney(goal.currentAmount)} of {formatMoney(goal.targetAmount)}
            </p>
          </div>
        </div>

        <GoalProgressBar value={goal.progress.progressPct} label="Progress" />

        <dl className="space-y-1.5 text-xs">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Remaining</dt>
            <dd className="min-w-0 truncate text-right font-medium tabular-nums">
              {formatMoney(goal.progress.remaining)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Est. completion</dt>
            <dd className="min-w-0 truncate text-right font-medium">{etaLabel}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{goal.name}</CardTitle>
              <CardDescription className="tabular-nums">
                {formatMoney(goal.currentAmount)} of {formatMoney(goal.targetAmount)}
              </CardDescription>
            </div>
          </div>
          {onEdit || onDelete ? (
            <div className="flex shrink-0 gap-1">
              {onEdit ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Edit goal"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Delete goal"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <GoalProgressBar value={goal.progress.progressPct} label="Progress" />

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <Typography variant="caption" className="text-muted-foreground">
              Remaining
            </Typography>
            <Typography variant="label" as="p" className="truncate tabular-nums">
              {formatMoney(goal.progress.remaining)}
            </Typography>
          </div>
          <div className="min-w-0">
            <Typography variant="caption" className="text-muted-foreground">
              Est. completion
            </Typography>
            <Typography variant="label" as="p" className="truncate">
              {etaLabel}
            </Typography>
          </div>
        </div>

        <div className={cn('flex flex-wrap gap-2')}>
          <Badge variant="secondary">{formatPercent(goal.progress.progressPct, 0)} complete</Badge>
          {goal.progress.onTrack === true ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400">
              On track
            </Badge>
          ) : null}
          {goal.progress.onTrack === false ? (
            <Badge variant="destructive">Behind target date</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
