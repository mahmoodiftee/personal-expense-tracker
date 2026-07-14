import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MoneyDto } from '../../../../common/dto/money.dto';
import { CategoryInputDto } from './category-input.dto';

/** Payload to add a variable (ad-hoc) expense. */
export class CreateVariableExpenseDto {
  @ValidateNested()
  @Type(() => MoneyDto)
  amount!: MoneyDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description!: string;

  /** When the money was spent (ISO-8601). */
  @IsISO8601()
  occurredAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryInputDto)
  category?: CategoryInputDto;
}
