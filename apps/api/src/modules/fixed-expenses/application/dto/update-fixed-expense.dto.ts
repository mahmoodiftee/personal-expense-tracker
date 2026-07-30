import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import { PlanSubtype, RecurringStatus } from '@finance/shared';
import { MoneyDto } from '../../../../common/dto/money.dto';
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

  @IsOptional()
  @IsEnum(PlanSubtype)
  planSubtype?: PlanSubtype;

  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  principalAmount?: MoneyDto;
}
