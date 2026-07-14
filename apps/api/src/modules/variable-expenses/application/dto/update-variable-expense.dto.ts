import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MoneyDto } from '../../../../common/dto/money.dto';
import { CategoryInputDto } from './category-input.dto';

/** Partial payload to edit a variable expense. Omitted fields are left as-is. */
export class UpdateVariableExpenseDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  amount?: MoneyDto;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  /** Pass null to clear the note; omit to leave unchanged. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  /** Link to a catalogue category; takes precedence over inline `category`. */
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryInputDto)
  category?: CategoryInputDto;
}
