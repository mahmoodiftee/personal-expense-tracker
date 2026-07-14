import { Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';

import type { DashboardViewModel } from '../types';

type ForecastCardProps = Pick<
  DashboardViewModel,
  'forecastAmount' | 'forecastConfidence' | 'forecastMethod'
>;

export function ForecastCard({
  forecastAmount,
  forecastConfidence,
  forecastMethod,
}: ForecastCardProps) {
  return (
    <Card className="transition-colors hover:bg-secondary/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Next month forecast
        </CardTitle>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"
          aria-hidden="true"
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Typography variant="h2" className="tabular-nums">
          {forecastAmount ?? '—'}
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          {forecastConfidence ? (
            <Badge variant="secondary">{forecastConfidence} confidence</Badge>
          ) : null}
          <Typography variant="caption" className="text-muted-foreground">
            {forecastMethod} model
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
