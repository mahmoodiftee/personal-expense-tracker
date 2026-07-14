import { TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const trendVariant = {
  up: 'success' as const,
  down: 'destructive' as const,
  neutral: 'secondary' as const,
};

export function StatCard({ label, value, hint, trend, className }: StatCardProps) {
  const TrendIcon = trend?.direction === 'down' ? TrendingDown : TrendingUp;

  return (
    <Card className={cn('transition-colors hover:bg-secondary/30', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Typography variant="h2" className="tabular-nums">
          {value}
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          {trend ? (
            <Badge variant={trendVariant[trend.direction]} className="gap-1">
              {trend.direction !== 'neutral' ? (
                <TrendIcon className="h-3 w-3" aria-hidden="true" />
              ) : null}
              {trend.value}
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
