'use client';

import type { Insight } from '@finance/shared';
import { CheckCircle2 } from 'lucide-react';

import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

import { insightTypeIcon, insightTypeLabel } from '../lib/insight-labels';
import { InsightSeverityBadge } from './insight-severity-badge';

type InsightCardProps = {
  insight: Insight;
  viewed?: boolean;
  compact?: boolean;
  onView?: (id: string) => void;
};

const severityAccent: Record<Insight['severity'], string> = {
  INFO: 'border-l-sky-500/70',
  SUCCESS: 'border-l-emerald-500/70',
  WARNING: 'border-l-amber-500/70',
  CRITICAL: 'border-l-red-500/80',
};

export function InsightCard({ insight, viewed = false, compact, onView }: InsightCardProps) {
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
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm',
        'transition-all duration-300 hover:border-border hover:shadow-md',
        'border-l-[3px]',
        severityAccent[insight.severity],
        viewed && 'opacity-70',
        compact ? 'p-4' : 'p-5',
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground',
            compact ? 'h-9 w-9' : 'h-11 w-11',
          )}
          aria-hidden="true"
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <Typography variant="label" className="leading-snug">
                {insight.title}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                {insightTypeLabel(insight.type)}
              </Typography>
            </div>
            <InsightSeverityBadge severity={insight.severity} />
          </div>

          {!compact ? (
            <Typography variant="body-sm" className="leading-relaxed text-muted-foreground">
              {insight.message}
            </Typography>
          ) : (
            <Typography variant="body-sm" className="line-clamp-2 text-muted-foreground">
              {insight.message}
            </Typography>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Typography variant="caption" className="text-muted-foreground">
              {generatedLabel}
            </Typography>
            <div className="flex items-center gap-2">
              {viewed ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Viewed
                </span>
              ) : null}
              {onView && !viewed ? (
                <button
                  type="button"
                  className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                  onClick={() => onView(insight.id)}
                >
                  Mark viewed
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
