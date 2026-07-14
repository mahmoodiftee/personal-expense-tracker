'use client';

import type { CurrencyCode } from '@finance/shared';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, FadeIn, Typography } from '@/components/design-system';

import type { VariableExpenseItemView } from '../types';
import { AddVariableExpenseForm } from './add-variable-expense-form';
import { VariableExpenseItem } from './variable-expense-item';
import type { CreateVariableExpenseInput } from '../types';

type VariableExpensesSectionProps = {
  items: VariableExpenseItemView[];
  currency: CurrencyCode;
  monthKey: string;
  isLoading?: boolean;
  isPending?: boolean;
  onAdd: (input: CreateVariableExpenseInput) => void;
  onDelete: (id: string) => void;
};

export function VariableExpensesSection({
  items,
  currency,
  monthKey,
  isLoading,
  isPending,
  onAdd,
  onDelete,
}: VariableExpensesSectionProps) {
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

      <AddVariableExpenseForm
        currency={currency}
        monthKey={monthKey}
        isPending={isPending}
        onSubmit={onAdd}
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
                <VariableExpenseItem item={item} disabled={isPending} onDelete={onDelete} />
              </li>
            ))}
          </ul>
        </FadeIn>
      ) : null}
    </section>
  );
}
