'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, FadeIn, Typography } from '@/components/design-system';

import type { FixedExpenseItemView } from '../types';
import { FixedExpenseItem } from './fixed-expense-item';

type FixedExpensesSectionProps = {
  items: FixedExpenseItemView[];
  isLoading?: boolean;
  isPending?: boolean;
  onToggle: (expenseId: string, isPaid: boolean) => void;
};

export function FixedExpensesSection({
  items,
  isLoading,
  isPending,
  onToggle,
}: FixedExpensesSectionProps) {
  return (
    <section aria-labelledby="fixed-expenses-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Typography id="fixed-expenses-heading" variant="h2">
          Fixed expenses
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {items.length} items
        </Typography>
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading fixed expenses">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          title="No fixed expenses"
          description="Recurring bills and subscriptions for this month will appear here."
        />
      ) : null}

      {!isLoading && items.length > 0 ? (
        <FadeIn>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <FixedExpenseItem item={item} disabled={isPending} onToggle={onToggle} />
              </li>
            ))}
          </ul>
        </FadeIn>
      ) : null}
    </section>
  );
}
