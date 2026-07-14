'use client';

import type { CategoryBudgetStatus } from '@finance/shared';
import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { formatMoney, formatPercent } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { BudgetProgressBar } from './budget-progress-bar';

type BudgetCardProps = {
  item: CategoryBudgetStatus;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function BudgetCard({ item, compact, onEdit, onDelete }: BudgetCardProps) {
  return (
    <Card>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="mt-1 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <div>
              <CardTitle className="text-base">{item.categoryName}</CardTitle>
              <CardDescription>
                {formatMoney(item.actual)} of {formatMoney(item.budget)} spent
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
                  aria-label="Edit budget"
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
                  aria-label="Delete budget"
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
        <BudgetProgressBar value={item.usedPct} isOverBudget={item.isOverBudget} label="Used" />

        <div className={cn('grid gap-2 text-sm', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
          <div>
            <Typography variant="caption" className="text-muted-foreground">
              Budget
            </Typography>
            <Typography variant="label" className="tabular-nums">
              {formatMoney(item.budget)}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-muted-foreground">
              Actual
            </Typography>
            <Typography variant="label" className="tabular-nums">
              {formatMoney(item.actual)}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-muted-foreground">
              Remaining
            </Typography>
            <Typography
              variant="label"
              className={cn('tabular-nums', item.isOverBudget && 'text-destructive')}
            >
              {formatMoney(item.remaining)}
            </Typography>
          </div>
        </div>

        {!compact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formatPercent(item.usedPct, 0)} used</Badge>
            {item.isOverBudget ? <Badge variant="destructive">Over budget</Badge> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
