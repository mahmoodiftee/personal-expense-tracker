import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import type { MetricCardTrend } from '../types';

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accentClassName?: string;
  trend?: MetricCardTrend;
  /** When `negative-up`, an increase shows as destructive (e.g. expenses). */
  trendSemantics?: 'positive-up' | 'negative-up';
  className?: string;
};

function trendVariant(
  direction: MetricCardTrend['direction'],
  semantics: MetricCardProps['trendSemantics'],
) {
  if (direction === 'neutral') return 'secondary' as const;
  if (semantics === 'negative-up') {
    return direction === 'up' ? ('destructive' as const) : ('success' as const);
  }
  return direction === 'up' ? ('success' as const) : ('destructive' as const);
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accentClassName,
  trend,
  trendSemantics = 'positive-up',
  className,
}: MetricCardProps) {
  const TrendIcon = trend?.direction === 'down' ? TrendingDown : TrendingUp;

  return (
    <Card className={cn('transition-colors hover:bg-secondary/30', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10',
            accentClassName,
          )}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Typography variant="h2" className="tabular-nums">
          {value}
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          {trend ? (
            <Badge variant={trendVariant(trend.direction, trendSemantics)} className="gap-1">
              {trend.direction !== 'neutral' ? (
                <TrendIcon className="h-3 w-3" aria-hidden="true" />
              ) : null}
              <span>{trend.value}</span>
              <span className="sr-only"> vs prior month</span>
            </Badge>
          ) : null}
          {hint ? (
            <Typography variant="caption" className="text-muted-foreground">
              {hint}
            </Typography>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
