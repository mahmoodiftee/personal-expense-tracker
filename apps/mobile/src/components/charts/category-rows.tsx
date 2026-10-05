import { View } from 'react-native';

import { IconChip, ProgressBar, TrendChip, Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import type { TrendDelta } from '@finance/client';

import { iconForName } from './category-grid';
import type { ChartSlice } from './chart-types';

export type CategoryRow = ChartSlice & {
  trend?: TrendDelta | null;
};

type CategoryRowsProps = {
  title?: string;
  rows: CategoryRow[];
};

export function CategoryRows({ title, rows }: CategoryRowsProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <View className="gap-2">
      {title ? <Typography variant="h2">{title}</Typography> : null}
      {rows.map((row) => (
        <Card key={row.name}>
          <CardContent className="gap-3 py-3.5">
            <View className="flex-row items-center gap-3">
              <IconChip
                icon={iconForName(row.name)}
                color={row.color}
                background={`${row.color}22`}
              />
              <View className="min-w-0 flex-1">
                <Typography variant="body" className="font-semibold">
                  {row.name}
                </Typography>
                <Typography variant="caption">{Math.round(row.sharePct)}% of total</Typography>
              </View>
              <View className="items-end gap-1">
                <Typography variant="body" className="font-semibold tabular-nums">
                  {row.total}
                </Typography>
                {row.trend && row.trend.value !== '—' ? (
                  <TrendChip value={row.trend.value} direction={row.trend.direction} />
                ) : null}
              </View>
            </View>
            <ProgressBar value={row.sharePct} color={row.color} />
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
