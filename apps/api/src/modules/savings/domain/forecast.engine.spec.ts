import { ForecastMethod } from '@finance/shared';
import { forecastSavings } from './forecast.engine';

describe('forecastSavings', () => {
  it('returns zeros for empty series', () => {
    const result = forecastSavings([], ForecastMethod.SMA, 3);
    expect(result.values).toEqual([0, 0, 0]);
    expect(result.confidencePct).toBe(0);
  });

  it('projects flat SMA for stable series', () => {
    const result = forecastSavings([100_000, 100_000, 100_000], ForecastMethod.SMA, 2);
    expect(result.values).toEqual([100_000, 100_000]);
    expect(result.confidencePct).toBeGreaterThan(0);
  });

  it('projects upward trend with linear regression', () => {
    const result = forecastSavings(
      [100_000, 110_000, 120_000],
      ForecastMethod.LINEAR_REGRESSION,
      1,
    );
    expect(result.values[0]).toBeGreaterThan(120_000);
  });
});
