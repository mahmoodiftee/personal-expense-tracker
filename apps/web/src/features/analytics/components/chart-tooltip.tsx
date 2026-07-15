'use client';

import { type CurrencyCode } from '@finance/shared';

import { Typography } from '@/components/design-system';
import { APP_CURRENCY } from '@/lib/currency-config';
import { formatChartCurrency } from '@/lib/chart-theme';

type AnalyticsChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  currency?: CurrencyCode;
  valueFormatter?: (value: number, name?: string) => string;
};

export function AnalyticsChartTooltip({
  active,
  payload,
  label,
  currency = APP_CURRENCY,
  valueFormatter,
}: AnalyticsChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <Typography variant="label" className="mb-1 block">
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography key={entry.name} variant="caption" className="block tabular-nums">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          {typeof entry.value === 'number'
            ? valueFormatter
              ? valueFormatter(entry.value, entry.name)
              : formatChartCurrency(entry.value, currency)
            : '—'}
        </Typography>
      ))}
    </div>
  );
}
