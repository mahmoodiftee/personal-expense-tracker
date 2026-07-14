import { ForecastMethod } from '@finance/shared';

/**
 * Pure, framework-free savings forecast engine. Given a chronological series of
 * historical savings (integer minor units, oldest → newest), it projects the
 * next `horizon` months and reports a confidence score.
 *
 * Kept side-effect free and dependency-light so it is trivially unit-testable
 * and reusable by the future AI layer (SRP, Dependency Inversion).
 */

export interface ForecastResult {
  /** Projected values (minor units) for each future month, length = horizon. */
  readonly values: number[];
  /** Confidence 0–100 = data-sufficiency × (fit for regression / stability). */
  readonly confidencePct: number;
}

/** Months of history at which data-sufficiency reaches its maximum. */
const FULL_CONFIDENCE_MONTHS = 6;

export function forecastSavings(
  series: readonly number[],
  method: ForecastMethod,
  horizon: number,
): ForecastResult {
  const safeHorizon = Math.max(0, Math.trunc(horizon));
  if (series.length === 0 || safeHorizon === 0) {
    return { values: new Array<number>(safeHorizon).fill(0), confidencePct: 0 };
  }

  switch (method) {
    case ForecastMethod.LINEAR_REGRESSION:
      return linearRegression(series, safeHorizon);
    case ForecastMethod.WMA:
      return constantForecast(weightedMovingAverage(series), series, safeHorizon);
    case ForecastMethod.SMA:
    default:
      return constantForecast(mean(series), series, safeHorizon);
  }
}

/** SMA/WMA project a flat line at `prediction`; confidence from series stability. */
function constantForecast(
  prediction: number,
  series: readonly number[],
  horizon: number,
): ForecastResult {
  const values = new Array<number>(horizon).fill(Math.round(prediction));
  const stability = 1 - clamp01(coefficientOfVariation(series));
  return { values, confidencePct: confidence(series.length, stability) };
}

/** Ordinary least-squares trend; confidence from goodness-of-fit (R²). */
function linearRegression(series: readonly number[], horizon: number): ForecastResult {
  const n = series.length;
  if (n === 1) {
    return {
      values: new Array<number>(horizon).fill(Math.round(series[0]!)),
      confidencePct: confidence(1, 0),
    };
  }

  const xs = series.map((_, i) => i);
  const meanX = mean(xs);
  const meanY = mean(series);

  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i += 1) {
    sxx += (xs[i]! - meanX) ** 2;
    sxy += (xs[i]! - meanX) * (series[i]! - meanY);
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;

  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i += 1) {
    const predicted = intercept + slope * xs[i]!;
    ssTot += (series[i]! - meanY) ** 2;
    ssRes += (series[i]! - predicted) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : clamp01(1 - ssRes / ssTot);

  const values: number[] = [];
  for (let k = 1; k <= horizon; k += 1) {
    values.push(Math.round(intercept + slope * (n - 1 + k)));
  }
  return { values, confidencePct: confidence(n, rSquared) };
}

function weightedMovingAverage(series: readonly number[]): number {
  let weightedSum = 0;
  let weightTotal = 0;
  series.forEach((value, index) => {
    const weight = index + 1; // more recent months weigh more
    weightedSum += value * weight;
    weightTotal += weight;
  });
  return weightTotal === 0 ? 0 : weightedSum / weightTotal;
}

function mean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((sum, x) => sum + x, 0) / xs.length;
}

function standardDeviation(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  const variance = xs.reduce((sum, x) => sum + (x - m) ** 2, 0) / xs.length;
  return Math.sqrt(variance);
}

/** Relative dispersion; 0 = perfectly stable series. Guards divide-by-zero. */
function coefficientOfVariation(xs: readonly number[]): number {
  const m = Math.abs(mean(xs));
  if (m === 0) return standardDeviation(xs) === 0 ? 0 : 1;
  return standardDeviation(xs) / m;
}

/** Blend data-sufficiency with a quality factor (stability or R²) → 0–100. */
function confidence(sampleCount: number, qualityFactor: number): number {
  const sufficiency = clamp01(sampleCount / FULL_CONFIDENCE_MONTHS);
  return round2(sufficiency * clamp01(qualityFactor) * 100);
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
