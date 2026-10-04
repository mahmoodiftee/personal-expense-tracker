import type { LucideIcon } from 'lucide-react';
import { MoreHorizontal, TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import type { MetricCardTrend } from '../types';

/** Soft tinted badge behind each metric icon, mirroring the dashboard mockup. */
const toneClasses = {
  primary: 'bg-primary/20 text-[hsl(100_40%_25%)] dark:text-primary',
  sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-500',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
} as const;

export type MetricTone = keyof typeof toneClasses;

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: MetricTone;
  trend?: MetricCardTrend;
  /** When `negative-up`, an increase shows as destructive (e.g. expenses). */
  trendSemantics?: 'positive-up' | 'negative-up';
  className?: string;
};

function trendTextClasses(
  direction: MetricCardTrend['direction'],
  semantics: MetricCardProps['trendSemantics'],
) {
  if (direction === 'neutral') return 'text-muted-foreground';
  const isGood = semantics === 'negative-up' ? direction === 'down' : direction === 'up';
  return isGood ? 'text-success' : 'text-destructive';
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
  trend,
  trendSemantics = 'positive-up',
  className,
}: MetricCardProps) {
  const TrendIcon = trend?.direction === 'down' ? TrendingDown : TrendingUp;

  return (
    <Card className={cn('transition-shadow hover:shadow-raised', className)}>
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                toneClasses[tone],
              )}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </span>
            <Typography variant="label" as="span" className="truncate">
              {label}
            </Typography>
          </div>
          <span className="shrink-0 text-muted-foreground" aria-hidden="true">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Typography variant="h2" className="tabular-nums">
            {value}
          </Typography>
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
                trendTextClasses(trend.direction, trendSemantics),
              )}
            >
              {trend.direction !== 'neutral' ? (
                <TrendIcon className="h-3 w-3" aria-hidden="true" />
              ) : null}
              {trend.value}
              <span className="sr-only"> vs prior month</span>
            </span>
          ) : null}
        </div>

        {hint ? (
          <Typography variant="caption" className="block text-muted-foreground">
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
