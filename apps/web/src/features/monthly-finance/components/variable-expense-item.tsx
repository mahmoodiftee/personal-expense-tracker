'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import type { VariableExpenseItemView } from '../types';

type VariableExpenseItemProps = {
  item: VariableExpenseItemView;
  disabled?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function VariableExpenseItem({
  item,
  disabled,
  onEdit,
  onDelete,
}: VariableExpenseItemProps) {
  return (
    <div
      className={cn(
        'flex min-h-[3.25rem] items-center gap-3 rounded-lg border border-border bg-card px-3 py-3',
        disabled && 'opacity-60',
      )}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: item.categoryColor }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <Typography variant="label" className="block truncate">
          {item.description}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {item.categoryName} · {new Date(item.occurredAt).toLocaleDateString()}
        </Typography>
      </div>
      <Typography variant="label" className="shrink-0 tabular-nums">
        {item.amount}
      </Typography>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground"
        aria-label={`Edit ${item.description}`}
        disabled={disabled}
        onClick={() => onEdit(item.id)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Delete ${item.description}`}
        disabled={disabled}
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
