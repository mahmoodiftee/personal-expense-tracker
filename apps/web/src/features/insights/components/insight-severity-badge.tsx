import { InsightSeverity } from '@finance/shared';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { severityLabel } from '../lib/insight-labels';

type InsightSeverityBadgeProps = {
  severity: InsightSeverity;
  compact?: boolean;
  className?: string;
};

const severityStyles: Record<
  InsightSeverity,
  { variant: 'secondary' | 'warning' | 'destructive' | 'success'; className?: string }
> = {
  [InsightSeverity.INFO]: {
    variant: 'secondary',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  },
  [InsightSeverity.SUCCESS]: {
    variant: 'success',
  },
  [InsightSeverity.WARNING]: {
    variant: 'warning',
  },
  [InsightSeverity.CRITICAL]: {
    variant: 'destructive',
    className: 'animate-pulse',
  },
};

export function InsightSeverityBadge({ severity, compact, className }: InsightSeverityBadgeProps) {
  const styles = severityStyles[severity];

  return (
    <Badge
      variant={styles.variant}
      className={cn(
        'shrink-0 font-medium',
        compact ? 'px-1.5 py-0 text-[0.625rem] tracking-normal' : 'tracking-wide',
        styles.className,
        className,
      )}
    >
      {severityLabel(severity)}
    </Badge>
  );
}
