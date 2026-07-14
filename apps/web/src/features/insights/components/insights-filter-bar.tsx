'use client';

import { InsightSeverity } from '@finance/shared';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { severityFilterLabel } from '../lib/insight-labels';
import { SEVERITY_FILTER_OPTIONS, type SeverityFilter } from '../lib/insights-utils';

type InsightsFilterBarProps = {
  value: SeverityFilter;
  onChange: (value: SeverityFilter) => void;
  counts: Partial<Record<SeverityFilter, number>>;
};

export function InsightsFilterBar({ value, onChange, counts }: InsightsFilterBarProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter insights by severity"
    >
      {SEVERITY_FILTER_OPTIONS.map((option) => {
        const active = value === option;
        const count = counts[option];

        return (
          <Button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            size="sm"
            variant={active ? 'default' : 'outline'}
            className={cn(
              'shrink-0 rounded-full px-4',
              option === InsightSeverity.CRITICAL && !active && 'border-red-500/30',
              option === InsightSeverity.WARNING && !active && 'border-amber-500/30',
            )}
            onClick={() => onChange(option)}
          >
            {severityFilterLabel(option)}
            {count !== undefined ? ` (${count})` : ''}
          </Button>
        );
      })}
    </div>
  );
}
