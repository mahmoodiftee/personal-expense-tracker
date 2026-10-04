'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Typography } from '@/components/design-system';
import { shiftMonthKey } from '@/lib/month';

type MonthNavigatorProps = {
  monthKey: string;
  monthLabel: string;
  onChange: (monthKey: string) => void;
};

const stepClasses =
  'flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function MonthNavigator({ monthKey, monthLabel, onChange }: MonthNavigatorProps) {
  return (
    <nav
      aria-label="Month selection"
      className="flex items-center gap-1 rounded-full bg-card p-1 shadow-card"
    >
      <button
        type="button"
        className={stepClasses}
        aria-label="Previous month"
        onClick={() => onChange(shiftMonthKey(monthKey, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <Typography variant="label" as="span" className="min-w-[7.5rem] text-center">
        {monthLabel}
      </Typography>
      <button
        type="button"
        className={stepClasses}
        aria-label="Next month"
        onClick={() => onChange(shiftMonthKey(monthKey, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
