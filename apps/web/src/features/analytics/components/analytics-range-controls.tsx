'use client';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/design-system';

type RangePreset = 3 | 6 | 12;

type AnalyticsRangeControlsProps = {
  monthCount: RangePreset;
  rangeLabel: string;
  onMonthCountChange: (count: RangePreset) => void;
};

const PRESETS: RangePreset[] = [3, 6, 12];

export function AnalyticsRangeControls({
  monthCount,
  rangeLabel,
  onMonthCountChange,
}: AnalyticsRangeControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Typography variant="body-sm" className="text-muted-foreground">
        {rangeLabel}
      </Typography>
      <div className="flex gap-2" role="group" aria-label="Analysis range">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant={monthCount === preset ? 'default' : 'outline'}
            onClick={() => onMonthCountChange(preset)}
          >
            {preset}m
          </Button>
        ))}
      </div>
    </div>
  );
}
