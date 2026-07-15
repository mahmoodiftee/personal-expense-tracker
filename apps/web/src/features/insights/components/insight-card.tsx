'use client';

import type { Insight } from '@finance/shared';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import { formatInsightMessage } from '../lib/insights-utils';
import { insightTypeIcon } from '../lib/insight-labels';
import { InsightSeverityBadge } from './insight-severity-badge';

type InsightCardProps = {
  insight: Insight;
  viewed?: boolean;
  compact?: boolean;
  onView?: (id: string) => void;
  className?: string;
};

const severityIconBg: Record<Insight['severity'], string> = {
  INFO: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  SUCCESS: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  WARNING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function InsightCard({
  insight,
  viewed = false,
  compact,
  onView,
  className,
}: InsightCardProps) {
  const Icon = insightTypeIcon(insight.type);
  const generatedLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(insight.generatedAt));

  return (
    <article
      className={cn(
        compact
          ? 'flex gap-3 py-3 last:pb-0 first:pt-0'
          : 'rounded-lg border border-border bg-card p-4',
        viewed && 'opacity-65',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg',
          compact ? 'mt-0.5 h-8 w-8' : 'h-10 w-10',
          severityIconBg[insight.severity],
        )}
        aria-hidden="true"
      >
        <Icon className={compact ? 'h-4 w-4' : 'h-[1.125rem] w-[1.125rem]'} />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Typography as="p" variant="label" className="leading-snug">
            {insight.title}
          </Typography>
          <InsightSeverityBadge severity={insight.severity} compact={compact} />
        </div>

        <Typography
          as="p"
          variant="body-sm"
          className={cn('leading-relaxed', compact && 'line-clamp-2')}
        >
          {formatInsightMessage(insight.message)}
        </Typography>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <Typography as="span" variant="caption" className="text-muted-foreground">
            {generatedLabel}
          </Typography>
          {viewed ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Viewed
            </span>
          ) : onView ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => onView(insight.id)}
            >
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
