import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RecurringStatus } from '@finance/shared';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/**
 * Payload to update income-source metadata. Amount changes go through the
 * dedicated amount endpoint so history is preserved (never overwritten).
 */
export class UpdateIncomeSourceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsOptional()
  @IsEnum(RecurringStatus)
  status?: RecurringStatus;

  @IsOptional()
  @IsMonthKey()
  endMonth?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}
