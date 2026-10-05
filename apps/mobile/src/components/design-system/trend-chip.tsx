import { View } from 'react-native';

import { cn } from '@/lib/cn';
import type { TrendDirection } from '@finance/client';

import { Typography } from './typography';

type TrendChipProps = {
  value: string;
  direction?: TrendDirection;
};

export function TrendChip({ value, direction = 'neutral' }: TrendChipProps) {
  return (
    <View
      className={cn(
        'self-start rounded-full px-2 py-0.5',
        direction === 'up' && 'bg-success/15',
        direction === 'down' && 'bg-destructive/15',
        direction === 'neutral' && 'bg-muted',
      )}
    >
      <Typography
        variant="caption"
        className={cn(
          'text-xs font-semibold tabular-nums',
          direction === 'up' && 'text-success',
          direction === 'down' && 'text-destructive',
          direction === 'neutral' && 'text-muted-foreground',
        )}
      >
        {value}
      </Typography>
    </View>
  );
}
