import {
  currentMonthKey,
  formatMonthLabel,
  mapMonthlyFinanceToViewModel,
  shiftMonthKey,
  useMonthlyFinance,
  useToggleFixedPayment,
  useToggleVariablePayment,
  type MonthlyFinanceViewModel,
} from '@finance/client';
import type { MonthKey } from '@finance/shared';
import * as Haptics from 'expo-haptics';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { iconForCategory } from '@/components/charts/category-icon';
import {
  EmptyState,
  ErrorState,
  IconChip,
  MoneyText,
  PageShell,
  ProgressBar,
  SectionHeader,
  StatCard,
  Typography,
} from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/theme-provider';

function MonthSkeleton() {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <Skeleton className="h-36 flex-1 rounded-tile" />
        <Skeleton className="h-36 flex-1 rounded-tile" />
      </View>
      <Skeleton className="h-24 w-full rounded-tile" />
      <Skeleton className="h-16 w-full rounded-tile" />
      <Skeleton className="h-16 w-full rounded-tile" />
    </View>
  );
}

function settledPercent(viewModel: MonthlyFinanceViewModel): number {
  const { totalCommittedMinor, totalSpentMinor } = viewModel.calculations;
  if (totalCommittedMinor <= 0) return 0;
  return Math.round((totalSpentMinor / totalCommittedMinor) * 100);
}

export function MonthScreen() {
  const { palette } = useTheme();
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isRefetching } = useMonthlyFinance(month);
  const toggleFixed = useToggleFixedPayment(month);
  const toggleVariable = useToggleVariablePayment(month);

  const viewModel = data
    ? mapMonthlyFinanceToViewModel(data.fixed, data.variable, data.income)
    : null;

  const busy = toggleFixed.isPending || toggleVariable.isPending;
  const billCount = viewModel ? viewModel.summary.paidCount + viewModel.summary.unpaidCount : 0;
  const paidPct = viewModel ? settledPercent(viewModel) : 0;

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
      hero={
        <FinanceHero
          month={month}
          onChange={setMonth}
          remaining={viewModel?.summary.remaining ?? '৳0.00'}
          overspent={viewModel?.summary.isRemainingNegative ?? false}
          chip={
            viewModel && billCount > 0
              ? `${viewModel.summary.paidCount} of ${billCount} paid`
              : undefined
          }
        />
      }
    >
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
          <View className="flex-row gap-3">
            <StatCard
              variant="contrast"
              label="Income"
              value={viewModel.summary.incomeTotal}
              icon={TrendingUp}
              iconColor={palette.primary}
              iconBackground={`${palette.primary}22`}
            />
            <StatCard
              variant="raised"
              label="Spent"
              value={viewModel.summary.totalSpent}
              icon={Receipt}
              iconColor={palette.primary}
              iconBackground={palette.card}
            />
          </View>

          <Card>
            <CardContent className="gap-4 py-5">
              <View className="flex-row items-end justify-between gap-3">
                <View className="gap-1">
                  <Typography variant="caption">Settled</Typography>
                  <Typography variant="title" className="tabular-nums">
                    {paidPct}%
                  </Typography>
                </View>
                <Typography variant="caption" className="mb-1 text-right">
                  {viewModel.summary.totalSpent} paid
                  {'\n'}
                  {viewModel.summary.fixedUnpaid} fixed still due
                </Typography>
              </View>
              <ProgressBar value={paidPct} />
            </CardContent>
          </Card>

          <View className="gap-2">
            <SectionHeader title="Fixed bills" />
            {viewModel.fixedItems.length === 0 ? (
              <EmptyState
                title="No fixed expenses"
                description="Add fixed bills from the web app or the Expenses screen."
              />
            ) : (
              viewModel.fixedItems.map((item) => (
                <BillRow
                  key={item.id}
                  title={item.name}
                  subtitle={`Due day ${item.dueDay}`}
                  amount={item.amount}
                  paid={item.isPaid}
                  busy={busy}
                  icon={iconForCategory(item.name)}
                  iconColor={palette.primary}
                  iconBackground={`${palette.primary}22`}
                  onToggle={() => {
                    void handleFixedToggle(item.id, !item.isPaid);
                  }}
                />
              ))
            )}
          </View>

          <View className="gap-2">
            <SectionHeader title="Variable spending" />
            {viewModel.variableItems.length === 0 ? (
              <EmptyState
                title="No variable expenses"
                description="Tap Add to capture a spend for this month."
              />
            ) : (
              viewModel.variableItems.map((item) => (
                <BillRow
                  key={item.id}
                  title={item.description}
                  subtitle={`${item.categoryName} · ${formatShortDate(item.occurredAt)}`}
                  amount={item.amount}
                  paid={item.isPaid}
                  busy={busy}
                  icon={iconForCategory(item.categoryName)}
                  iconColor={item.categoryColor}
                  iconBackground={`${item.categoryColor}22`}
                  onToggle={() => {
                    void handleVariableToggle(item.id, !item.isPaid);
                  }}
                />
              ))
            )}
          </View>
        </View>
      ) : null}
    </PageShell>
  );
}

function FinanceHero({
  month,
  onChange,
  remaining,
  overspent,
  chip,
}: {
  month: MonthKey;
  onChange: (month: MonthKey) => void;
  remaining: string;
  overspent: boolean;
  chip?: string;
}) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const ink = palette.heroForeground;

  return (
    <View className="overflow-hidden rounded-b-hero bg-hero" style={{ paddingTop: insets.top + 8 }}>
      <View className="gap-6 px-5 pb-7 pt-3">
        <View className="flex-row items-center justify-between">
          <Typography variant="h2" style={{ color: ink }}>
            Finance
          </Typography>
          <View
            className="flex-row items-center rounded-full px-1 py-1"
            style={{ backgroundColor: '#000000' }}
          >
            <Pressable
              accessibilityLabel="Previous month"
              onPress={() => onChange(shiftMonthKey(month, -1))}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <ChevronLeft size={16} color="#FFFFFF" />
            </Pressable>
            <Typography
              variant="caption"
              className="min-w-[96px] text-center text-xs font-semibold"
              style={{ color: '#FFFFFF' }}
            >
              {formatMonthLabel(month)}
            </Typography>
            <Pressable
              accessibilityLabel="Next month"
              onPress={() => onChange(shiftMonthKey(month, 1))}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <ChevronRight size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View className="gap-2">
          <Typography variant="label" style={{ color: ink }}>
            {overspent ? 'Over budget' : 'Left to spend'}
          </Typography>
          <MoneyText value={remaining} variant="hero" color={ink} />
          {chip ? (
            <View
              className="self-start rounded-full px-2.5 py-1"
              style={{ backgroundColor: '#000000' }}
            >
              <Typography
                variant="caption"
                className="text-xs font-semibold"
                style={{ color: '#FFFFFF' }}
              >
                {chip}
              </Typography>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function BillRow({
  title,
  subtitle,
  amount,
  paid,
  busy,
  icon,
  iconColor,
  iconBackground,
  onToggle,
}: {
  title: string;
  subtitle: string;
  amount: string;
  paid: boolean;
  busy: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ checked: paid, disabled: busy }}
      accessibilityLabel={`${paid ? 'Mark unpaid' : 'Mark paid'}: ${title}`}
      disabled={busy}
      onPress={onToggle}
      className={cn('rounded-tile bg-card', busy && 'opacity-60')}
    >
      <View className="flex-row items-center gap-3 px-3.5 py-3.5">
        <PayMark paid={paid} />
        <IconChip
          icon={icon}
          color={iconColor}
          background={iconBackground}
          size={40}
          iconSize={18}
        />
        <View className="min-w-0 flex-1">
          <Typography
            variant="body"
            className={cn('font-semibold', paid && 'text-muted-foreground')}
            numberOfLines={1}
          >
            {title}
          </Typography>
          <Typography variant="caption" numberOfLines={1}>
            {subtitle}
          </Typography>
        </View>
        <Typography
          variant="body"
          className={cn('font-semibold tabular-nums', paid && 'text-muted-foreground')}
        >
          {amount}
        </Typography>
      </View>
    </Pressable>
  );
}

function PayMark({ paid }: { paid: boolean }) {
  const { palette } = useTheme();

  return (
    <View
      className="h-7 w-7 items-center justify-center rounded-full"
      style={{
        backgroundColor: paid ? palette.primary : 'transparent',
        borderWidth: paid ? 0 : 1.5,
        borderColor: palette.mutedForeground,
      }}
    >
      {paid ? <Check size={14} color={palette.primaryForeground} strokeWidth={3} /> : null}
    </View>
  );
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
