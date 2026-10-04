'use client';

import { cn } from '@/lib/utils';

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
      <div
        className="inline-flex items-center gap-1 rounded-full bg-muted p-1"
        role="group"
        aria-label="Analysis range"
      >
        {PRESETS.map((preset) => {
          const isActive = monthCount === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onMonthCountChange(preset)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {preset}m
            </button>
          );
        })}
      </div>
    </div>
  );
}
