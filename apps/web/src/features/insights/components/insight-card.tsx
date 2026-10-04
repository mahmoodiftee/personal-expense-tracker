'use client';

import type { Insight } from '@finance/shared';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/design-system';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
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
  const reducedMotion = useReducedMotion();
  const Icon = insightTypeIcon(insight.type);
  const generatedLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(insight.generatedAt));

  if (compact) {
    return (
      <article
        className={cn(
          'group/insight rounded-2xl px-2 py-2 transition-[background-color,box-shadow]',
          reducedMotion ? 'duration-0' : 'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:bg-muted/50 hover:shadow-card focus-within:bg-muted/50 focus-within:shadow-card',
          viewed && 'opacity-65',
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              severityIconBg[insight.severity],
            )}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Typography as="p" variant="label" className="truncate leading-snug">
                {insight.title}
              </Typography>
              <InsightSeverityBadge severity={insight.severity} compact className="shrink-0" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity]',
            reducedMotion ? 'duration-0' : 'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'grid-rows-[0fr] opacity-0',
            'group-hover/insight:grid-rows-[1fr] group-hover/insight:opacity-100',
            'group-focus-within/insight:grid-rows-[1fr] group-focus-within/insight:opacity-100',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-2 pt-2.5 pl-[2.625rem]">
              <Typography
                as="p"
                variant="body-sm"
                className="line-clamp-3 leading-relaxed text-muted-foreground"
              >
                {formatInsightMessage(insight.message)}
              </Typography>

              <div className="flex items-center justify-between gap-2">
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
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        viewed && 'opacity-65',
        className,
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            severityIconBg[insight.severity],
          )}
          aria-hidden="true"
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Typography as="p" variant="label" className="leading-snug">
              {insight.title}
            </Typography>
            <InsightSeverityBadge severity={insight.severity} />
          </div>

          <Typography as="p" variant="body-sm" className="leading-relaxed">
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
      </div>
    </article>
  );
}
