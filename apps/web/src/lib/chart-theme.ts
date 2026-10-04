import type { CurrencyCode } from '@finance/shared';

import { TAKA_SYMBOL } from './currency-config';
import { formatTakaAmount } from './format-money';

/**
 * Shared Recharts theme. Values resolve through CSS variables so charts follow
 * the active light/dark theme without a re-render.
 */
export const CHART_COLORS = {
  income: 'hsl(var(--chart-income))',
  expenses: 'hsl(var(--chart-expenses))',
  fixed: 'hsl(var(--chart-fixed))',
  variable: 'hsl(var(--chart-variable))',
  savings: 'hsl(var(--chart-savings))',
  savingsRate: 'hsl(var(--chart-savings-rate))',
  forecast: 'hsl(var(--chart-forecast))',
  /** Highlighted series/bar — the lime brand accent. */
  active: 'hsl(var(--primary))',
  /** Resting bar fill for unhighlighted columns. */
  inactive: 'hsl(var(--chart-inactive))',
  grid: 'hsl(var(--chart-grid))',
  muted: 'hsl(var(--muted-foreground))',
} as const;

export const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };

export function formatChartCurrency(value: number, _currency?: CurrencyCode): string {
  return formatTakaAmount(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatChartCompact(value: number): string {
  return value >= 1000
    ? `${TAKA_SYMBOL}${(value / 1000).toFixed(0)}k`
    : formatTakaAmount(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
