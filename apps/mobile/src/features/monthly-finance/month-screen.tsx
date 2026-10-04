import {
  currentMonthKey,
  mapMonthlyFinanceToViewModel,
  useMonthlyFinance,
  useToggleFixedPayment,
  useToggleVariablePayment,
} from '@finance/client';
import type { MonthKey } from '@finance/shared';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  Typography,
} from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

function MonthSkeleton() {
  return (
    <View className="gap-3">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </View>
  );
}

export function MonthScreen() {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isRefetching } = useMonthlyFinance(month);
  const toggleFixed = useToggleFixedPayment(month);
  const toggleVariable = useToggleVariablePayment(month);

  const viewModel = data
    ? mapMonthlyFinanceToViewModel(data.fixed, data.variable, data.income)
    : null;

  const busy = toggleFixed.isPending || toggleVariable.isPending;

  async function handleFixedToggle(expenseId: string, isPaid: boolean) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFixed.mutate({ expenseId, isPaid });
  }

  async function handleVariableToggle(expenseId: string, isPaid: boolean) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleVariable.mutate({ expenseId, isPaid });
  }

  return (
    <PageShell
      refreshing={isRefetching}
      onRefresh={() => {
        void refetch();
      }}
      footer={
        viewModel ? (
          <View className="border-t border-border bg-card px-4 pb-6 pt-3">
            <Typography variant="caption">Remaining this month</Typography>
            <Typography
              variant="h1"
              className={cn(
                'tabular-nums',
                viewModel.summary.isRemainingNegative ? 'text-destructive' : 'text-foreground',
              )}
            >
              {viewModel.summary.remaining}
            </Typography>
            <Typography variant="caption">
              Income {viewModel.summary.incomeTotal} · Spent {viewModel.summary.totalSpent}
            </Typography>
          </View>
        ) : null
      }
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Typography variant="label">Operations</Typography>
          <Typography variant="h1">This month</Typography>
        </View>
        <MonthNavigator monthKey={month} onChange={setMonth} />
      </View>

      {isLoading ? <MonthSkeleton /> : null}

      {isError ? (
        <ErrorState
          title="Could not load month"
          message={error?.message ?? 'Something went wrong while fetching your data.'}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && viewModel ? (
        <View className="gap-5">
          <Card>
            <CardContent className="gap-3">
              <View className="flex-row flex-wrap gap-2">
                <SummaryChip label="Fixed paid" value={viewModel.summary.fixedPaid} />
                <SummaryChip label="Fixed due" value={viewModel.summary.fixedUnpaid} />
                <SummaryChip label="Variable paid" value={viewModel.summary.variablePaid} />
                <SummaryChip label="Variable due" value={viewModel.summary.variableUnpaid} />
              </View>
            </CardContent>
          </Card>

          <View className="gap-2">
            <Typography variant="h2">Fixed bills</Typography>
            {viewModel.fixedItems.length === 0 ? (
              <EmptyState
                title="No fixed expenses"
                description="Add fixed bills from the web app or the Expenses screen."
              />
            ) : (
              viewModel.fixedItems.map((item) => (
                <Pressable
                  key={item.id}
                  disabled={busy}
                  onPress={() => {
                    void handleFixedToggle(item.id, !item.isPaid);
                  }}
                  className={cn(
                    'flex-row items-center gap-3 rounded-2xl bg-muted/60 px-3.5 py-3',
                    item.isPaid && 'bg-primary/15',
                    busy && 'opacity-60',
                  )}
                >
                  <Switch
                    value={item.isPaid}
                    disabled={busy}
                    onValueChange={(value) => {
                      void handleFixedToggle(item.id, value);
                    }}
                  />
                  <View className="min-w-0 flex-1">
                    <Typography variant="body" className="text-sm font-semibold">
                      {item.name}
                    </Typography>
                    <Typography variant="caption">Due day {item.dueDay}</Typography>
                  </View>
                  <Typography variant="body" className="text-sm font-semibold tabular-nums">
                    {item.amount}
                  </Typography>
                </Pressable>
              ))
            )}
          </View>

          <View className="gap-2">
            <Typography variant="h2">Variable spending</Typography>
            {viewModel.variableItems.length === 0 ? (
              <EmptyState
                title="No variable expenses"
                description="Tap Add to capture a spend for this month."
              />
            ) : (
              viewModel.variableItems.map((item) => (
                <Pressable
                  key={item.id}
                  disabled={busy}
                  onPress={() => {
                    void handleVariableToggle(item.id, !item.isPaid);
                  }}
                  className={cn(
                    'flex-row items-center gap-3 rounded-2xl bg-muted/60 px-3.5 py-3',
                    item.isPaid && 'bg-primary/15',
                    busy && 'opacity-60',
                  )}
                >
                  <Switch
                    value={item.isPaid}
                    disabled={busy}
                    onValueChange={(value) => {
                      void handleVariableToggle(item.id, value);
                    }}
                  />
                  <View className="min-w-0 flex-1">
                    <Typography variant="body" className="text-sm font-semibold">
                      {item.description}
                    </Typography>
                    <Typography variant="caption">
                      {item.categoryName} · {new Date(item.occurredAt).toLocaleDateString()}
                    </Typography>
                  </View>
                  <Typography variant="body" className="text-sm font-semibold tabular-nums">
                    {item.amount}
                  </Typography>
                </Pressable>
              ))
            )}
          </View>
        </View>
      ) : null}
    </PageShell>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 rounded-2xl bg-muted/50 px-3 py-2.5">
      <Typography variant="caption">{label}</Typography>
      <Typography variant="body" className="text-sm font-semibold tabular-nums">
        {value}
      </Typography>
    </View>
  );
}
