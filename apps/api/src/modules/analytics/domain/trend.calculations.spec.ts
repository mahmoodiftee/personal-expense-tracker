import { TrendDirection } from '@finance/shared';
import { computeSeriesDirection, computeTrendDelta } from './trend.calculations';

describe('computeTrendDelta', () => {
  it('detects upward change', () => {
    const delta = computeTrendDelta(150, 100);
    expect(delta.amountMinor).toBe(50);
    expect(delta.direction).toBe(TrendDirection.UP);
    expect(delta.changePct).toBe(50);
  });

  it('detects flat change', () => {
    const delta = computeTrendDelta(100, 100);
    expect(delta.direction).toBe(TrendDirection.FLAT);
  });
});

describe('computeSeriesDirection', () => {
  it('detects improving second half', () => {
    expect(computeSeriesDirection([100, 100, 200, 200])).toBe(TrendDirection.UP);
  });

  it('returns flat for single point', () => {
    expect(computeSeriesDirection([100])).toBe(TrendDirection.FLAT);
  });
});
