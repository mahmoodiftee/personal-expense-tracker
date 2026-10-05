import { formatMoney, useLoansOverview } from '@finance/client';
import type { MonthKey } from '@finance/shared';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ProgressRing } from '@/components/charts/progress-ring';
import { Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/theme-provider';

type DashboardLoanCardProps = {
  month: MonthKey;
};

export function DashboardLoanCard({ month }: DashboardLoanCardProps) {
  const router = useRouter();
  const { palette } = useTheme();
  const { data, isLoading } = useLoansOverview(month);
  const loans = data?.loans ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedId =
    activeId && loans.some((loan) => loan.id === activeId) ? activeId : loans[0]?.id;
  const loan = loans.find((item) => item.id === selectedId);

  if (isLoading) {
    return <Skeleton className="h-44 w-full" />;
  }

  if (!loan) {
    return null;
  }

  const { progress } = loan;
  const monthsLabel =
    progress.monthsRemaining === null
      ? 'Open term'
      : progress.monthsRemaining === 0
        ? 'Final month'
        : `${progress.monthsRemaining} months left`;

  return (
    <View className="gap-2">
      <Pressable onPress={() => router.push('/loans')}>
        <Card variant="raised" className="overflow-hidden">
          <View
            pointerEvents="none"
            className="absolute -left-10 -top-12 h-40 w-40 rounded-full"
            style={{ backgroundColor: palette.primary, opacity: 0.12 }}
          />
          <CardContent className="gap-5 py-5">
            <View className="flex-row items-center justify-between">
              <Typography variant="caption" className="font-semibold text-foreground">
                Bank loan
              </Typography>
              <View className="flex-row items-center gap-0.5">
                <Typography variant="caption" className="font-semibold text-foreground">
                  Details
                </Typography>
                <ChevronRight size={14} color={palette.foreground} />
              </View>
            </View>

            <View className="flex-row items-center gap-5">
              <ProgressRing
                value={progress.progressPct}
                trackColor={palette.card}
                fillColor={palette.primary}
                labelColor={palette.foreground}
                caption="paid"
              />
              <View className="min-w-0 flex-1 gap-1">
                <Typography variant="h2" numberOfLines={1}>
                  {loan.name}
                </Typography>
                <Typography variant="display" className="tabular-nums">
                  {formatMoney(progress.remaining)}
                </Typography>
                <Typography variant="caption">{monthsLabel}</Typography>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-tile bg-card px-3 py-2.5">
                <Typography variant="caption">Monthly EMI</Typography>
                <Typography variant="body" className="font-semibold tabular-nums">
                  {progress.monthlyInstallment ? formatMoney(progress.monthlyInstallment) : '—'}
                </Typography>
              </View>
              <View className="flex-1 rounded-tile bg-card px-3 py-2.5">
                <Typography variant="caption">Borrowed</Typography>
                <Typography variant="body" className="font-semibold tabular-nums">
                  {formatMoney(progress.totalTaken)}
                </Typography>
              </View>
            </View>
          </CardContent>
        </Card>
      </Pressable>

      {loans.length > 1 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {loans.map((item) => {
            const selected = item.id === selectedId;
            return (
              <Pressable
                key={item.id}
                onPress={() => setActiveId(item.id)}
                className={cn('rounded-full px-3 py-1.5', selected ? 'bg-primary' : 'bg-raised')}
              >
                <Typography
                  variant="caption"
                  className="font-semibold"
                  style={{ color: selected ? palette.heroForeground : palette.mutedForeground }}
                >
                  {item.name}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
