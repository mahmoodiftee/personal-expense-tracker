import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SavingsGoalTemplate } from '@finance/shared';

import { MoneyDto } from '../../../../common/dto/money.dto';

export class CreateSavingsGoalDto {
  @IsEnum(SavingsGoalTemplate)
  template!: SavingsGoalTemplate;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @ValidateNested()
  @Type(() => MoneyDto)
  targetAmount!: MoneyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  currentAmount?: MoneyDto;

  @IsOptional()
  @IsISO8601()
  targetDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
