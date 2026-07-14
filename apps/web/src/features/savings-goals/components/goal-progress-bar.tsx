import { cn } from '@/lib/utils';

type GoalProgressBarProps = {
  value: number;
  className?: string;
  label?: string;
};

export function GoalProgressBar({ value, className, label }: GoalProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('space-y-1', className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums">{clamped.toFixed(0)}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Goal progress'}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
