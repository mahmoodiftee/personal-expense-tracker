import {
  InsightSeverity,
  InsightType,
  MoneyMath,
  PaymentStatus,
  type MonthKey,
  type MonthlyExpenseStatus,
  type MonthlySavings,
} from '@finance/shared';

import { round2 } from '../../../common/util/math.util';
import { computeTrendDelta } from './trend.calculations';

/** Minimum month-over-month spending increase to emit a spike insight. */
export const SPENDING_INCREASE_THRESHOLD_PCT = 20;
/** Minimum month-over-month savings increase to emit a savings insight. */
export const SAVINGS_INCREASE_THRESHOLD_PCT = 15;
/** Months of history scanned when detecting first-time spending categories. */
export const NEW_CATEGORY_LOOKBACK_MONTHS = 12;

export type CategorySpendRow = {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly color: string;
  readonly totalMinor: number;
  readonly transactionCount: number;
};

export type InsightsEngineInput = {
  readonly monthKey: MonthKey;
  readonly currentMonth: MonthlySavings;
  readonly previousMonth: MonthlySavings | null;
  readonly currentCategories: readonly CategorySpendRow[];
  readonly historicalCategoriesByMonth: ReadonlyMap<MonthKey, readonly CategorySpendRow[]>;
  readonly fixedExpenseStatus: MonthlyExpenseStatus;
};

export type InsightDraft = {
  readonly type: InsightType;
  readonly severity: InsightSeverity;
  readonly title: string;
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly monthKey: MonthKey;
};

export function generateInsights(input: InsightsEngineInput): readonly InsightDraft[] {
  const results: InsightDraft[] = [];

  const spendingInsight = buildSpendingIncreaseInsight(input);
  if (spendingInsight) results.push(spendingInsight);

  const savingsInsight = buildSavingsIncreaseInsight(input);
  if (savingsInsight) results.push(savingsInsight);

  const largestCategoryInsight = buildLargestCategoryInsight(input);
  if (largestCategoryInsight) results.push(largestCategoryInsight);

  const unpaidBillsInsight = buildUnpaidBillsInsight(input);
  if (unpaidBillsInsight) results.push(unpaidBillsInsight);

  const newCategoryInsight = buildNewCategoryInsight(input);
  if (newCategoryInsight) results.push(newCategoryInsight);

  return results;
}

function buildSpendingIncreaseInsight(input: InsightsEngineInput): InsightDraft | null {
  if (!input.previousMonth) return null;

  const currentMinor = input.currentMonth.totalExpense.amountMinor;
  const previousMinor = input.previousMonth.totalExpense.amountMinor;
  if (currentMinor <= previousMinor) return null;

  const delta = computeTrendDelta(currentMinor, previousMinor);
  if (delta.changePct <= SPENDING_INCREASE_THRESHOLD_PCT) return null;

  const current = input.currentMonth.totalExpense;
  const previous = input.previousMonth.totalExpense;

  return {
    type: InsightType.SPENDING_SPIKE,
    severity: delta.changePct >= 50 ? InsightSeverity.CRITICAL : InsightSeverity.WARNING,
    title: 'Spending increased sharply',
    message: `Total spending rose ${delta.changePct.toFixed(0)}% compared to last month (${MoneyMath.format(previous)} → ${MoneyMath.format(current)}).`,
    data: {
      currentMinor,
      previousMinor,
      changePct: delta.changePct,
      changeMinor: delta.amountMinor,
    },
    monthKey: input.monthKey,
  };
}

function buildSavingsIncreaseInsight(input: InsightsEngineInput): InsightDraft | null {
  if (!input.previousMonth) return null;

  const currentMinor = input.currentMonth.savings.amountMinor;
  const previousMinor = input.previousMonth.savings.amountMinor;
  if (currentMinor <= previousMinor) return null;

  const changePct =
    previousMinor === 0
      ? 100
      : round2(((currentMinor - previousMinor) / Math.abs(previousMinor)) * 100);
  if (changePct <= SAVINGS_INCREASE_THRESHOLD_PCT) return null;

  const current = input.currentMonth.savings;
  const previous = input.previousMonth.savings;

  return {
    type: InsightType.SAVINGS_INCREASE,
    severity: InsightSeverity.SUCCESS,
    title: 'Savings increased',
    message: `Savings rose ${changePct.toFixed(0)}% compared to last month (${MoneyMath.format(previous)} → ${MoneyMath.format(current)}).`,
    data: {
      currentMinor,
      previousMinor,
      changePct,
      changeMinor: currentMinor - previousMinor,
    },
    monthKey: input.monthKey,
  };
}

function buildLargestCategoryInsight(input: InsightsEngineInput): InsightDraft | null {
  const categories = input.currentCategories.filter((row) => row.totalMinor > 0);
  if (categories.length === 0) return null;

  const top = categories.reduce((best, row) => (row.totalMinor > best.totalMinor ? row : best));
  const totalMinor = categories.reduce((sum, row) => sum + row.totalMinor, 0);
  const sharePct = totalMinor ? round2((top.totalMinor / totalMinor) * 100) : 0;
  const total = { amountMinor: top.totalMinor, currency: input.currentMonth.currency };

  return {
    type: InsightType.LARGEST_SPENDING_CATEGORY,
    severity: InsightSeverity.INFO,
    title: 'Largest spending category',
    message: `${top.categoryName} is your top expense category this month at ${MoneyMath.format(total)} (${sharePct.toFixed(0)}% of tracked spending).`,
    data: {
      categoryId: top.categoryId,
      categoryName: top.categoryName,
      color: top.color,
      totalMinor: top.totalMinor,
      sharePct,
      transactionCount: top.transactionCount,
    },
    monthKey: input.monthKey,
  };
}

function buildUnpaidBillsInsight(input: InsightsEngineInput): InsightDraft | null {
  const unpaid = input.fixedExpenseStatus.items.filter(
    (item) => item.status === PaymentStatus.UNPAID,
  );
  if (unpaid.length === 0) return null;

  const names = unpaid.map((item) => item.name);
  const totalUnpaid = input.fixedExpenseStatus.totalUnpaid;
  const severity =
    unpaid.length === input.fixedExpenseStatus.items.length
      ? InsightSeverity.CRITICAL
      : InsightSeverity.WARNING;

  return {
    type: InsightType.UNPAID_FIXED_BILLS,
    severity,
    title: unpaid.length === 1 ? 'Unpaid fixed bill' : 'Unpaid fixed bills',
    message:
      unpaid.length === 1
        ? `${names[0]} is still unpaid (${MoneyMath.format(totalUnpaid)} outstanding).`
        : `${unpaid.length} fixed bills are unpaid (${MoneyMath.format(totalUnpaid)} outstanding): ${names.join(', ')}.`,
    data: {
      unpaidCount: unpaid.length,
      totalUnpaidMinor: totalUnpaid.amountMinor,
      bills: unpaid.map((item) => ({
        expenseId: item.expenseId,
        name: item.name,
        amountMinor: item.amount.amountMinor,
        dueDay: item.dueDay,
      })),
    },
    monthKey: input.monthKey,
  };
}

function buildNewCategoryInsight(input: InsightsEngineInput): InsightDraft | null {
  const current = input.currentCategories.filter((row) => row.totalMinor > 0);
  if (current.length === 0) return null;

  const seenCategoryIds = new Set<string>();
  for (const rows of input.historicalCategoriesByMonth.values()) {
    for (const row of rows) {
      if (row.totalMinor > 0) seenCategoryIds.add(row.categoryId);
    }
  }

  const newCategories = current.filter((row) => !seenCategoryIds.has(row.categoryId));
  if (newCategories.length === 0) return null;

  const names = newCategories.map((row) => row.categoryName);

  return {
    type: InsightType.NEW_SPENDING_CATEGORY,
    severity: InsightSeverity.INFO,
    title: newCategories.length === 1 ? 'New spending category' : 'New spending categories',
    message:
      newCategories.length === 1
        ? `${names[0]} appeared in your spending for the first time this month.`
        : `New spending categories detected: ${names.join(', ')}.`,
    data: {
      categories: newCategories.map((row) => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        color: row.color,
        totalMinor: row.totalMinor,
        transactionCount: row.transactionCount,
      })),
    },
    monthKey: input.monthKey,
  };
}
