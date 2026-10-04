'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

type ExpenseListRowProps = {
  title: string;
  subtitle: string;
  amount: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function ExpenseListRow({
  title,
  subtitle,
  amount,
  onEdit,
  onDelete,
  disabled,
}: ExpenseListRowProps) {
  return (
    <div
      className={cn(
        'flex min-h-[3.25rem] items-center gap-3 rounded-2xl bg-muted/45 px-3.5 py-3 transition-colors hover:bg-muted/70',
        disabled && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1">
        <Typography variant="label" className="block truncate">
          {title}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {subtitle}
        </Typography>
      </div>
      <Typography variant="label" className="shrink-0 tabular-nums">
        {amount}
      </Typography>
      <div className="flex shrink-0 gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground"
          aria-label={`Edit ${title}`}
          disabled={disabled}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${title}`}
          disabled={disabled}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
