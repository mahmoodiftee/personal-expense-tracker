import { CreditCard } from 'lucide-react';

import { MetricCard } from './metric-card';
import type { DashboardViewModel } from '../types';

type ExpenseCardProps = Pick<
  DashboardViewModel,
  'expenses' | 'expenseFixed' | 'expenseVariable' | 'expenseTrend'
>;

export function ExpenseCard({
  expenses,
  expenseFixed,
  expenseVariable,
  expenseTrend,
}: ExpenseCardProps) {
  return (
    <MetricCard
      label="Expenses"
      value={expenses}
      icon={CreditCard}
      trend={expenseTrend}
      trendSemantics="negative-up"
      hint={`Fixed ${expenseFixed} · Variable ${expenseVariable}`}
    />
  );
}
