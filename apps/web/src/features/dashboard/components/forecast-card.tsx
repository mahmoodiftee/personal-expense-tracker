import { Sparkles } from 'lucide-react';

import { MetricCard } from './metric-card';
import type { DashboardViewModel } from '../types';

type ForecastCardProps = Pick<
  DashboardViewModel,
  'forecastAmount' | 'forecastConfidence' | 'forecastMethod'
>;

export function ForecastCard({
  forecastAmount,
  forecastConfidence,
  forecastMethod,
}: ForecastCardProps) {
  const hint = forecastConfidence
    ? `${forecastConfidence} confidence · ${forecastMethod} model`
    : `${forecastMethod} model`;

  return (
    <MetricCard
      label="Next month"
      value={forecastAmount ?? '—'}
      icon={Sparkles}
      tone="amber"
      hint={hint}
    />
  );
}
