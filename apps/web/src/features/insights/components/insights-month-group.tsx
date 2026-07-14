'use client';

import type { Insight } from '@finance/shared';

import { Typography } from '@/components/design-system';
import { StaggerItem, StaggerList } from '@/components/design-system';
import { formatMonthLabel } from '@/lib/month';

import type { InsightMonthGroup } from '../lib/insights-utils';
import { InsightCard } from './insight-card';

type InsightsMonthGroupProps = {
  group: InsightMonthGroup;
  isViewed: (id: string) => boolean;
  onToggleViewed: (id: string) => void;
};

export function InsightsMonthGroup({ group, isViewed, onToggleViewed }: InsightsMonthGroupProps) {
  const label =
    group.monthKey === 'undated' ? 'General insights' : formatMonthLabel(group.monthKey);

  return (
    <section aria-labelledby={`insights-${group.monthKey}`} className="space-y-3">
      <Typography id={`insights-${group.monthKey}`} variant="h3" className="text-base sm:text-lg">
        {label}
      </Typography>
      <StaggerList className="space-y-3">
        {group.insights.map((insight: Insight) => (
          <StaggerItem key={insight.id}>
            <InsightCard insight={insight} viewed={isViewed(insight.id)} onView={onToggleViewed} />
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
