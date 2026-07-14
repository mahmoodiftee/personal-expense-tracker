'use client';

import type { BudgetAnalytics } from '@finance/shared';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';

import { BudgetCard } from './budget-card';

type BudgetAnalyticsSectionProps = {
  data: BudgetAnalytics;
};

export function BudgetAnalyticsSection({ data }: BudgetAnalyticsSectionProps) {
  const hasBudgets = data.overBudget.length + data.underBudget.length > 0;

  if (!hasBudgets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget status</CardTitle>
          <CardDescription>
            Over- and under-budget categories for the selected month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Typography variant="body-sm" className="text-muted-foreground">
            No category budgets for this month. Set limits on the budgets page to compare spending
            here.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Over budget</CardTitle>
          <CardDescription>
            Categories where actual spending exceeds the monthly limit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.overBudget.length === 0 ? (
            <Typography variant="body-sm" className="text-muted-foreground">
              All budgeted categories are within their limits.
            </Typography>
          ) : (
            data.overBudget.map((item) => <BudgetCard key={item.id} item={item} compact />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Under budget</CardTitle>
          <CardDescription>Categories with room left in the monthly limit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.underBudget.length === 0 ? (
            <Typography variant="body-sm" className="text-muted-foreground">
              No categories are under budget this month.
            </Typography>
          ) : (
            data.underBudget.map((item) => <BudgetCard key={item.id} item={item} compact />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
