import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { Typography } from './typography';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
};

function trendTextClasses(direction: NonNullable<StatCardProps['trend']>['direction']) {
  if (direction === 'neutral') return 'text-muted-foreground';
  return direction === 'up' ? 'text-success' : 'text-destructive';
}

export function StatCard({ label, value, hint, trend, className }: StatCardProps) {
  const TrendIcon = trend?.direction === 'down' ? TrendingDown : TrendingUp;

  return (
    <Card className={cn('transition-shadow hover:shadow-raised', className)}>
      <CardContent className="space-y-2 p-4 md:p-5">
        <Typography variant="label" as="span" className="text-muted-foreground">
          {label}
        </Typography>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Typography variant="h2" className="tabular-nums">
            {value}
          </Typography>
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
                trendTextClasses(trend.direction),
              )}
            >
              {trend.direction !== 'neutral' ? (
                <TrendIcon className="h-3 w-3" aria-hidden="true" />
              ) : null}
              {trend.value}
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
