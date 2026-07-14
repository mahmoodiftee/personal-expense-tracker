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
import { Cadence } from '@finance/shared';
import { MoneyDto } from '../../../../common/dto/money.dto';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Payload to create a new income source. */
export class CreateIncomeSourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ValidateNested()
  @Type(() => MoneyDto)
  amount!: MoneyDto;

  @IsOptional()
  @IsEnum(Cadence)
  cadence: Cadence = Cadence.MONTHLY;

  @IsInt()
  @Min(1)
  @Max(31)
  dueDay!: number;

  @IsMonthKey()
  startMonth!: string;

  @IsOptional()
  @IsMonthKey()
  endMonth?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}
