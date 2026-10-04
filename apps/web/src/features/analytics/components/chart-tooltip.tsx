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
    <div className="rounded-2xl bg-foreground px-3 py-2 text-background shadow-raised">
      <Typography variant="caption" className="mb-1 block opacity-80">
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography key={entry.name} variant="caption" className="block font-medium tabular-nums">
          {entry.name}:{' '}
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
