import { IsEnum, IsInt, Min } from 'class-validator';
import { CurrencyCode, type Money } from '@finance/shared';

/**
 * Reusable DTO for a {@link Money} value. Amounts are integer minor units and
 * must be non-negative for user-entered values (signed totals are computed
 * server-side, never accepted from clients).
 */
export class MoneyDto implements Money {
  @IsInt()
  @Min(0)
  amountMinor!: number;

  @IsEnum(CurrencyCode)
  currency!: CurrencyCode;
}
