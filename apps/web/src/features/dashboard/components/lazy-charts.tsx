'use client';

import dynamic from 'next/dynamic';

import { ChartPanelSkeleton } from '@/components/page-states';

export const TrendCharts = dynamic(
  () => import('./trend-charts').then((module) => ({ default: module.TrendCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanelSkeleton className="h-64" />
        <ChartPanelSkeleton className="h-64" />
      </div>
    ),
  },
);

export const CategoryBreakdown = dynamic(
  () => import('./category-breakdown').then((module) => ({ default: module.CategoryBreakdown })),
  {
    ssr: false,
    loading: () => <ChartPanelSkeleton />,
  },
);
