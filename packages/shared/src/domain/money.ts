import { type CurrencyCode } from './enums';

/**
 * Money is represented in **integer minor units** (e.g. cents) to eliminate
 * IEEE-754 floating point drift. `amountMinor` is always an integer. This shape
 * is the wire contract between API, clients, and the AI layer.
 */
export interface Money {
  /** Integer amount in the currency's smallest unit (e.g. cents). */
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
}

/** Minor units per major unit. All launch currencies use 100. */
const MINOR_UNITS_PER_MAJOR = 100;

/**
 * Pure, framework-agnostic helpers for {@link Money}. Reused identically on the
 * server, client, and (future) AI layer so arithmetic never diverges.
 */
export const MoneyMath = {
  fromMajor(amountMajor: number, currency: CurrencyCode): Money {
    return { amountMinor: Math.round(amountMajor * MINOR_UNITS_PER_MAJOR), currency };
  },

  toMajor(money: Money): number {
    return money.amountMinor / MINOR_UNITS_PER_MAJOR;
  },

  zero(currency: CurrencyCode): Money {
    return { amountMinor: 0, currency };
  },

  add(a: Money, b: Money): Money {
    MoneyMath.assertSameCurrency(a, b);
    return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
  },

  subtract(a: Money, b: Money): Money {
    MoneyMath.assertSameCurrency(a, b);
    return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
  },

  isNegative(money: Money): boolean {
    return money.amountMinor < 0;
  },

  /** Locale-aware display string, e.g. "৳1,250.00". */
  format(money: Money, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: money.currency }).format(
      MoneyMath.toMajor(money),
    );
  },

  assertSameCurrency(a: Money, b: Money): void {
    if (a.currency !== b.currency) {
      throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
    }
  },
};
