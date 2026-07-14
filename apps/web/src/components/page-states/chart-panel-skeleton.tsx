import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ChartPanelSkeletonProps = {
  className?: string;
};

/** Placeholder while Recharts chunks load client-side. */
export function ChartPanelSkeleton({ className }: ChartPanelSkeletonProps) {
  return <Skeleton className={cn('h-72 w-full rounded-xl', className)} aria-hidden="true" />;
}
