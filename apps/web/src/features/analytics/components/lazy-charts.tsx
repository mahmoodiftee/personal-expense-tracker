'use client';

import dynamic from 'next/dynamic';

import { ChartPanelSkeleton } from '@/components/page-states';

export const SpendingTrendsChart = dynamic(
  () =>
    import('./spending-trends-chart').then((module) => ({
      default: module.SpendingTrendsChart,
    })),
  {
    ssr: false,
    loading: () => <ChartPanelSkeleton />,
  },
);

export const SavingsTrendsChart = dynamic(
  () => import('./savings-trends-chart').then((module) => ({ default: module.SavingsTrendsChart })),
  {
    ssr: false,
    loading: () => <ChartPanelSkeleton />,
  },
);

export const MonthlyComparisonChart = dynamic(
  () =>
    import('./monthly-comparison-chart').then((module) => ({
      default: module.MonthlyComparisonChart,
    })),
  {
    ssr: false,
    loading: () => <ChartPanelSkeleton />,
  },
);

export const ForecastChart = dynamic(
  () => import('./forecast-chart').then((module) => ({ default: module.ForecastChart })),
  {
    ssr: false,
    loading: () => <ChartPanelSkeleton />,
  },
);
