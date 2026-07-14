/** Shared Recharts theme aligned with the ChatGPT-inspired design system. */
export const CHART_COLORS = {
  income: 'hsl(160 84% 39%)',
  expenses: 'hsl(0 72% 51%)',
  fixed: 'hsl(0 55% 55%)',
  variable: 'hsl(38 92% 50%)',
  savings: 'hsl(210 90% 55%)',
  savingsRate: 'hsl(160 70% 45%)',
  forecast: 'hsl(270 70% 60%)',
  grid: 'hsl(0 0% 18%)',
  muted: 'hsl(0 0% 55%)',
} as const;

export const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };

export function formatChartCurrency(value: number, currency = 'USD'): string {
  return value.toLocaleString(undefined, { style: 'currency', currency, maximumFractionDigits: 0 });
}

export function formatChartCompact(value: number): string {
  return `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`;
}
