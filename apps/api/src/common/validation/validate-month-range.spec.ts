import { validateMonthRange } from './validate-month-range';

describe('validateMonthRange', () => {
  it('returns inclusive months for valid range', () => {
    expect(validateMonthRange('2026-01', '2026-03', 12)).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('throws when from is after to', () => {
    expect(() => validateMonthRange('2026-05', '2026-01', 12)).toThrow(
      '`from` month must not be after `to` month',
    );
  });
});
