'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, FadeIn, Typography } from '@/components/design-system';
import { FixedExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog';
import { useCreateFixedExpenseMutation } from '@/features/expenses/hooks/use-expense-mutations';

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
  const [createOpen, setCreateOpen] = useState(false);
  const createFixed = useCreateFixedExpenseMutation();

  return (
    <>
      <Card aria-labelledby="fixed-expenses-heading">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <div className="min-w-0 space-y-0.5">
            <CardTitle id="fixed-expenses-heading" className="text-base md:text-lg">
              Fixed expenses
            </CardTitle>
            <Typography variant="caption" className="text-muted-foreground">
              {items.length} items
            </Typography>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 shadow-none"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add fixed expense
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="space-y-2" aria-busy="true" aria-label="Loading fixed expenses">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-2xl" />
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
        </CardContent>
      </Card>

      <FixedExpenseFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add fixed expense"
        submitLabel="Create fixed expense"
        onSubmit={async (values) => {
          await createFixed.mutateAsync(values);
        }}
      />
    </>
  );
}
