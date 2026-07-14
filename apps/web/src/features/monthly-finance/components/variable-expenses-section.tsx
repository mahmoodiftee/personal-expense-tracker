'use client';

import type { CurrencyCode } from '@finance/shared';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, FadeIn, Typography } from '@/components/design-system';

import type { VariableExpenseItemView } from '../types';
import { VariableExpenseFormActions } from './variable-expense-form-actions';
import { VariableExpenseItem } from './variable-expense-item';
import type { MonthlyFinanceData } from '../api/monthly-finance-api';

type VariableExpensesSectionProps = {
  items: VariableExpenseItemView[];
  rawItems: MonthlyFinanceData['variable'];
  currency: CurrencyCode;
  isLoading?: boolean;
  isPending?: boolean;
  onDelete: (id: string) => void;
};

export function VariableExpensesSection({
  items,
  rawItems,
  currency,
  isLoading,
  isPending,
  onDelete,
}: VariableExpensesSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingExpense = rawItems.find((item) => item.id === editingId) ?? null;

  return (
    <section aria-labelledby="variable-expenses-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Typography id="variable-expenses-heading" variant="h2">
          Variable expenses
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {items.length} items
        </Typography>
      </div>

      <VariableExpenseFormActions
        currency={currency}
        editingExpense={editingExpense}
        onEditClose={() => setEditingId(null)}
      />

      {isLoading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading variable expenses">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          title="No variable expenses"
          description="Track ad-hoc spending like groceries, dining, or transport."
        />
      ) : null}

      {!isLoading && items.length > 0 ? (
        <FadeIn>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <VariableExpenseItem
                  item={item}
                  disabled={isPending}
                  onEdit={setEditingId}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ul>
        </FadeIn>
      ) : null}
    </section>
  );
}
