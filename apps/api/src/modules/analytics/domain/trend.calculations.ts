import { TrendDirection, type TrendDelta } from '@finance/shared';

/**
 * Pure trend math shared by analytics use cases. Side-effect free and
 * framework-agnostic — trivially unit-testable (SRP).
 */

/** Computes the delta between `current` and `previous` (minor units). */
export function computeTrendDelta(current: number, previous: number): TrendDelta {
  const amountMinor = current - previous;
  const changePct =
    previous === 0 ? (current === 0 ? 0 : 100) : round2((amountMinor / Math.abs(previous)) * 100);
  const direction = toDirection(amountMinor);
  return { amountMinor, changePct, direction };
}

/**
 * Overall trend direction from a chronological series (oldest → newest).
 * Compares the average of the first half to the second half.
 */
export function computeSeriesDirection(series: readonly number[]): TrendDirection {
  if (series.length < 2) return TrendDirection.FLAT;
  const mid = Math.floor(series.length / 2);
  const firstHalf = series.slice(0, mid);
  const secondHalf = series.slice(mid);
  const firstAvg = mean(firstHalf);
  const secondAvg = mean(secondHalf);
  return toDirection(secondAvg - firstAvg);
}

export function averageMinor(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function toDirection(delta: number): TrendDirection {
  if (delta > 0) return TrendDirection.UP;
  if (delta < 0) return TrendDirection.DOWN;
  return TrendDirection.FLAT;
}

function mean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((sum, x) => sum + x, 0) / xs.length;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
