import { Type } from 'class-transformer';
import { IsISO8601, IsOptional, ValidateNested } from 'class-validator';
import { MoneyDto } from '../../../../common/dto/money.dto';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Payload to mark a fixed expense as paid for a given month. */
export class MarkPaidDto {
  @IsMonthKey()
  month!: string;

  /** Optional override; defaults to the amount effective that month. */
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  amount?: MoneyDto;

  /** Optional payment timestamp (ISO-8601); defaults to now. */
  @IsOptional()
  @IsISO8601()
  paidAt?: string;
}

/** Payload to mark a fixed expense as unpaid for a given month. */
export class MarkUnpaidDto {
  @IsMonthKey()
  month!: string;
}
