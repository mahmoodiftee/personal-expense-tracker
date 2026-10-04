import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Metric tile placeholder matching `MetricCard` proportions. */
function MetricSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

/**
 * Loading canvas that mirrors the loaded dashboard grid so cards do not
 * jump when data arrives.
 */
export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true">
      <div className="min-w-0 space-y-4">
        <section
          aria-label="Loading monthly metrics"
          className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
        >
          {/* Smart savings hero — stretches to match the 2×2 metric grid */}
          <Card className="flex min-h-[17.5rem] flex-col md:min-h-0 md:h-full">
            <CardContent className="flex flex-1 flex-col gap-5 p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-40 md:h-11" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="mt-auto grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        </section>

        {/* Cash flow */}
        <Card aria-label="Loading cash flow">
          <CardContent className="space-y-4 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-36 md:h-9" />
              </div>
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
            <Skeleton className="h-9 w-56 rounded-full" />
            <Skeleton className="h-64 w-full rounded-2xl md:h-72" />
          </CardContent>
        </Card>

        {/* Category budgets */}
        <Card aria-label="Loading budgets">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending by category */}
        <Card aria-label="Loading category breakdown">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <Skeleton className="mx-auto h-56 w-full max-w-xs rounded-full" />
              <ul className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <li key={index} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside aria-label="Loading account overview" className="min-w-0 space-y-4">
        {/* Loan repayment */}
        <div className="space-y-2">
          <Skeleton className="h-[13.5rem] w-full rounded-card" />
          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
          </div>
        </div>

        {/* Quick actions */}
        <Card>
          <CardContent className="space-y-3 p-4 md:p-5">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-full" />
              <Skeleton className="h-10 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-2xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings goals */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-2xl" />
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
