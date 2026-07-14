import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';

/** Canonical `YYYY-MM` pattern (months 01–12). */
export const MONTH_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Validates a `MonthKey` (`YYYY-MM`) DTO property with a clear error message.
 * Centralised so every module validates month keys identically (DRY).
 */
export function IsMonthKey(): PropertyDecorator {
  return applyDecorators(
    Matches(MONTH_KEY_REGEX, { message: 'must be a valid month in YYYY-MM format' }),
  );
}
