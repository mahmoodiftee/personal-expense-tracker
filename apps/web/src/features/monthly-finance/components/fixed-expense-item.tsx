'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import type { FixedExpenseItemView } from '../types';

type FixedExpenseItemProps = {
  item: FixedExpenseItemView;
  disabled?: boolean;
  onToggle: (expenseId: string, isPaid: boolean) => void;
};

export function FixedExpenseItem({ item, disabled, onToggle }: FixedExpenseItemProps) {
  const checkboxId = `fixed-expense-${item.id}`;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors',
        'hover:bg-secondary/40',
        item.isPaid && 'border-primary/30 bg-primary/5',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={item.isPaid}
        disabled={disabled}
        onCheckedChange={(checked) => onToggle(item.id, checked)}
        aria-label={`Mark ${item.name} as ${item.isPaid ? 'unpaid' : 'paid'}`}
      />
      <div className="min-w-0 flex-1">
        <Typography variant="label" className="block truncate">
          {item.name}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          Due day {item.dueDay}
          {item.isPaid && item.paidAt
            ? ` · Paid ${new Date(item.paidAt).toLocaleDateString()}`
            : ''}
        </Typography>
      </div>
      <Typography variant="label" className="shrink-0 tabular-nums">
        {item.amount}
      </Typography>
    </label>
  );
}
