'use client';

import type { SavingsGoalWithProgress } from '@finance/shared';
import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { formatMoney, formatPercent } from '@/lib/format-money';

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

  return (
    <Card>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base">{goal.name}</CardTitle>
              <CardDescription>
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

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <Typography variant="caption" className="text-muted-foreground">
              Remaining
            </Typography>
            <Typography variant="label" className="tabular-nums">
              {formatMoney(goal.progress.remaining)}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-muted-foreground">
              Est. completion
            </Typography>
            <Typography variant="label">{etaLabel}</Typography>
          </div>
        </div>

        {!compact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {formatPercent(goal.progress.progressPct, 0)} complete
            </Badge>
            {goal.progress.onTrack === true ? (
              <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                On track
              </Badge>
            ) : null}
            {goal.progress.onTrack === false ? (
              <Badge variant="destructive">Behind target date</Badge>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
