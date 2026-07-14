import { CurrencyCode, type Money } from '@finance/shared';
import { DomainValidationException } from '../exceptions/app.exception';

/** Ensures all non-zero amounts share one currency; returns USD when all are zero. */
export function reconcileCurrency(current: CurrencyCode | null, next: CurrencyCode): CurrencyCode {
  if (current !== null && current !== next) {
    throw new DomainValidationException('Mixed currencies are not supported yet');
  }
  return next;
}

/** Single currency across amounts, ignoring zero amounts (which carry defaults). */
export function resolveCurrencyFromMonies(monies: readonly Money[]): CurrencyCode {
  const currencies = new Set(monies.filter((m) => m.amountMinor !== 0).map((m) => m.currency));
  if (currencies.size > 1) {
    throw new DomainValidationException('Mixed currencies are not supported yet');
  }
  return [...currencies][0] ?? CurrencyCode.USD;
}
