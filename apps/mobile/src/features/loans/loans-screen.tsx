import { currentMonthKey, formatMoney, formatPercent, useLoansOverview } from '@finance/client';
import type { MonthKey } from '@finance/shared';
import { useState } from 'react';
import { View } from 'react-native';

import { DonutChart } from '@/components/charts/donut-chart';
import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  ProgressBar,
  ScreenHeader,
  Typography,
} from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { categoricalColors } from '@/lib/palette';
import { useTheme } from '@/providers/theme-provider';

export function LoansScreen() {
  const { palette } = useTheme();
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isRefetching } = useLoansOverview(month);
  const colors = categoricalColors(palette);

  return (
    <PageShell
      safeTop={false}
      tabBarInset={false}
      header={<ScreenHeader title="Loans" />}
      refreshing={isRefetching}
      onRefresh={() => {
        void refetch();
      }}
    >
      <MonthNavigator monthKey={month} onChange={setMonth} />

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
        {data && data.loans.length > 0 && data.loans[0] ? (
          <DonutChart
            title="Payoff mix"
            caption="Remaining"
            total={formatMoney({
              ...data.loans[0].progress.remaining,
              amountMinor: data.loans.reduce(
                (sum, loan) => sum + loan.progress.remaining.amountMinor,
                0,
              ),
            })}
            slices={data.loans.map((loan, index) => {
              const remainingTotal = data.loans.reduce(
                (sum, item) => sum + item.progress.remaining.amountMinor,
                0,
              );
              return {
                name: loan.name,
                color: colors[index % colors.length] ?? palette.primary,
                total: formatMoney(loan.progress.remaining),
                sharePct:
                  remainingTotal > 0
                    ? (loan.progress.remaining.amountMinor / remainingTotal) * 100
                    : 0,
              };
            })}
          />
        ) : null}
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
              <ProgressBar value={loan.progress.progressPct} />
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
