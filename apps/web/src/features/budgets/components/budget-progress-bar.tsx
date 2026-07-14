import { cn } from '@/lib/utils';

type BudgetProgressBarProps = {
  value: number;
  isOverBudget?: boolean;
  className?: string;
  label?: string;
};

export function BudgetProgressBar({
  value,
  isOverBudget,
  className,
  label,
}: BudgetProgressBarProps) {
  const displayPct = Math.round(value);
  const barWidth = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('space-y-1', className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className={cn('tabular-nums', isOverBudget && 'text-destructive')}>
            {displayPct}%
          </span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={displayPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Budget used'}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isOverBudget ? 'bg-destructive' : 'bg-primary',
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
