'use client';

import type { CurrencyCode } from '@finance/shared';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, FadeIn } from '@/components/design-system';

import type { VariableExpenseItemView } from '../types';
import { VariableExpenseFormActions } from './variable-expense-form-actions';
import { VariableExpenseItem } from './variable-expense-item';
import type { MonthlyFinanceData } from '../api/monthly-finance-api';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type VariableExpensesSectionProps = {
  items: VariableExpenseItemView[];
  rawItems: MonthlyFinanceData['variable'];
  currency: CurrencyCode;
  isLoading?: boolean;
  isPending?: boolean;
  onToggle: (expenseId: string, isPaid: boolean) => void;
  onDelete: (id: string) => void;
};

export function VariableExpensesSection({
  items,
  rawItems,
  currency,
  isLoading,
  isPending,
  onToggle,
  onDelete,
}: VariableExpensesSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingExpense = rawItems.find((item) => item.id === editingId) ?? null;
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Card aria-labelledby="variable-expenses-heading">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle id="variable-expenses-heading" className="text-base md:text-lg">
          Variable expenses
        </CardTitle>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 shadow-none"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add variable expense
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <VariableExpenseFormActions
          currency={currency}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
          editingExpense={editingExpense}
          onEditClose={() => setEditingId(null)}
        />

        {isLoading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading variable expenses">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-2xl" />
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
                    onToggle={onToggle}
                    onEdit={setEditingId}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          </FadeIn>
        ) : null}
      </CardContent>
    </Card>
  );
}
