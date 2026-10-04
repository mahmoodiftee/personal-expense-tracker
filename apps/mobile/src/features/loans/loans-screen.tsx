import { currentMonthKey, formatMoney, formatPercent, useLoansOverview } from '@finance/client';
import type { MonthKey } from '@finance/shared';
import { useState } from 'react';
import { View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  Typography,
} from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoansScreen() {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isRefetching } = useLoansOverview(month);

  return (
    <PageShell
      safeTop={false}
      refreshing={isRefetching}
      onRefresh={() => {
        void refetch();
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Typography variant="label">Debt</Typography>
          <Typography variant="h1">Loans</Typography>
        </View>
        <MonthNavigator monthKey={month} onChange={setMonth} />
      </View>

      {isLoading ? <Skeleton className="h-28 w-full" /> : null}

      {isError ? (
        <ErrorState
          title="Could not load loans"
          message={error?.message ?? 'Something went wrong.'}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && (data?.loans.length ?? 0) === 0 ? (
        <EmptyState
          title="No bank loans"
          description="Mark a fixed expense as a bank loan to track payoff progress here."
        />
      ) : null}

      <View className="gap-2">
        {data?.loans.map((loan) => (
          <Card key={loan.id}>
            <CardContent className="gap-2 py-3">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Typography variant="body" className="font-semibold">
                    {loan.name}
                  </Typography>
                  <Typography variant="caption">
                    Due day {loan.dueDay}
                    {loan.progress.monthsRemaining != null
                      ? ` · ${loan.progress.monthsRemaining} months left`
                      : ''}
                  </Typography>
                </View>
                <Typography variant="body" className="font-semibold tabular-nums">
                  {formatPercent(loan.progress.progressPct, 0)}
                </Typography>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-muted">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, Math.max(0, loan.progress.progressPct))}%`,
                  }}
                />
              </View>
              <Typography variant="caption">
                Paid {formatMoney(loan.progress.paid)} of {formatMoney(loan.progress.totalTaken)} ·
                Remaining {formatMoney(loan.progress.remaining)}
              </Typography>
              {loan.progress.monthlyInstallment ? (
                <Typography variant="caption">
                  EMI {formatMoney(loan.progress.monthlyInstallment)}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </View>
    </PageShell>
  );
}
