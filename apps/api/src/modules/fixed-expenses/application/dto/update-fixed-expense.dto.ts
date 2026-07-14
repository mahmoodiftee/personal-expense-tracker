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

/** Update fixed-expense metadata (amount changes use the amount endpoint). */
export class UpdateFixedExpenseDto {
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
