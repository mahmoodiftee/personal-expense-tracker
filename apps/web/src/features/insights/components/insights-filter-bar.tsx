'use client';

import { InsightSeverity } from '@finance/shared';

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
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-muted p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter insights by severity"
    >
      {SEVERITY_FILTER_OPTIONS.map((option) => {
        const active = value === option;
        const count = counts[option];

        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground',
              option === InsightSeverity.CRITICAL && !active && 'text-red-600 dark:text-red-400',
              option === InsightSeverity.WARNING && !active && 'text-amber-600 dark:text-amber-400',
            )}
            onClick={() => onChange(option)}
          >
            {severityFilterLabel(option)}
            {count !== undefined ? ` (${count})` : ''}
          </button>
        );
      })}
    </div>
  );
}
