import type { CurrencyCode } from '@finance/shared';

export type BudgetStatusInput = {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly color: string;
  readonly budgetMinor: number;
  readonly actualMinor: number;
  readonly currency: CurrencyCode;
};

export type BudgetStatusComputed = {
  readonly budgetMinor: number;
  readonly actualMinor: number;
  readonly remainingMinor: number;
  readonly usedPct: number;
  readonly isOverBudget: boolean;
};

export function computeCategoryBudgetStatus(input: BudgetStatusInput): BudgetStatusComputed {
  const budgetMinor = Math.max(input.budgetMinor, 0);
  const actualMinor = Math.max(input.actualMinor, 0);
  const remainingMinor = budgetMinor - actualMinor;
  const usedPct =
    budgetMinor === 0 ? (actualMinor > 0 ? 100 : 0) : round2((actualMinor / budgetMinor) * 100);

  return {
    budgetMinor,
    actualMinor,
    remainingMinor,
    usedPct,
    isOverBudget: actualMinor > budgetMinor,
  };
}

export function computeBudgetTotals(
  rows: readonly BudgetStatusComputed[],
  currency: CurrencyCode,
): {
  totalBudgetMinor: number;
  totalActualMinor: number;
  totalRemainingMinor: number;
  totalUsedPct: number;
  currency: CurrencyCode;
} {
  const totalBudgetMinor = rows.reduce((sum, row) => sum + row.budgetMinor, 0);
  const totalActualMinor = rows.reduce((sum, row) => sum + row.actualMinor, 0);
  const totalRemainingMinor = totalBudgetMinor - totalActualMinor;
  const totalUsedPct =
    totalBudgetMinor === 0 ? 0 : round2((totalActualMinor / totalBudgetMinor) * 100);

  return {
    totalBudgetMinor,
    totalActualMinor,
    totalRemainingMinor,
    totalUsedPct,
    currency,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
