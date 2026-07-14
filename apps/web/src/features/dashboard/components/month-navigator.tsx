'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/design-system';
import { shiftMonthKey } from '@/lib/month';

type MonthNavigatorProps = {
  monthKey: string;
  monthLabel: string;
  onChange: (monthKey: string) => void;
};

export function MonthNavigator({ monthKey, monthLabel, onChange }: MonthNavigatorProps) {
  return (
    <nav aria-label="Month selection" className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonthKey(monthKey, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Typography variant="label" className="min-w-[9rem] text-center">
        {monthLabel}
      </Typography>
      <Button
        variant="outline"
        size="icon"
        aria-label="Next month"
        onClick={() => onChange(shiftMonthKey(monthKey, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
