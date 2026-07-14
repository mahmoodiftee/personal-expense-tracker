import { InsightSeverity } from '@finance/shared';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { severityLabel } from '../lib/insight-labels';

type InsightSeverityBadgeProps = {
  severity: InsightSeverity;
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

export function InsightSeverityBadge({ severity, className }: InsightSeverityBadgeProps) {
  const styles = severityStyles[severity];

  return (
    <Badge
      variant={styles.variant}
      className={cn('shrink-0 font-medium tracking-wide', styles.className, className)}
    >
      {severityLabel(severity).toUpperCase()}
    </Badge>
  );
}
