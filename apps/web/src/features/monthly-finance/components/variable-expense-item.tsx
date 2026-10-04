'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import type { VariableExpenseItemView } from '../types';

type VariableExpenseItemProps = {
  item: VariableExpenseItemView;
  disabled?: boolean;
  onToggle: (expenseId: string, isPaid: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function VariableExpenseItem({
  item,
  disabled,
  onToggle,
  onEdit,
  onDelete,
}: VariableExpenseItemProps) {
  return (
    <div
      className={cn(
        'flex min-h-[3.25rem] items-center gap-3 rounded-2xl bg-muted/45 px-3.5 py-3 transition-colors hover:bg-muted/70',
        item.isPaid && 'bg-primary/10 hover:bg-primary/15',
        disabled && 'opacity-60',
      )}
    >
      <Checkbox
        checked={item.isPaid}
        disabled={disabled}
        onCheckedChange={(checked) => onToggle(item.id, checked)}
        aria-label={`Mark ${item.description} as ${item.isPaid ? 'unpaid' : 'paid'}`}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <Typography variant="label" className="block truncate">
          {item.description}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {item.categoryName} · {new Date(item.occurredAt).toLocaleDateString()}
          {item.isPaid && item.paidAt
            ? ` · Paid ${new Date(item.paidAt).toLocaleDateString()}`
            : ''}
        </Typography>
      </div>
      <Typography variant="label" className="shrink-0 tabular-nums">
        {item.amount}
      </Typography>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground"
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
        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Delete ${item.description}`}
        disabled={disabled}
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
