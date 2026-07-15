import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MoneyDto } from '../../../../common/dto/money.dto';

export class CreateExtraIncomeDto {
  @ValidateNested()
  @Type(() => MoneyDto)
  amount!: MoneyDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description!: string;

  @IsISO8601()
  occurredAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
