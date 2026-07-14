import { PiggyBank } from 'lucide-react';

import { MetricCard } from './metric-card';
import type { DashboardViewModel } from '../types';

type SavingsCardProps = Pick<DashboardViewModel, 'savings' | 'savingsRate' | 'savingsTrend'>;

export function SavingsCard({ savings, savingsRate, savingsTrend }: SavingsCardProps) {
  return (
    <MetricCard
      label="Savings"
      value={savings}
      icon={PiggyBank}
      trend={savingsTrend}
      hint={`${savingsRate} of income`}
    />
  );
}
