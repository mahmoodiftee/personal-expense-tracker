import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../common/domain/pagination';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/**
 * Query for the variable-expense history feed. Supports month, date-range, text,
 * tag, and amount filtering plus cursor pagination for infinite scroll.
 */
export class VariableExpenseQueryDto {
  @IsOptional()
  @IsMonthKey()
  month?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  /** Free-text search over description, notes, and category name. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  /** Comma-separated tags, e.g. `?tags=food,coffee`. */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : value,
  )
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAmountMinor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAmountMinor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = DEFAULT_PAGE_SIZE;

  @IsOptional()
  @IsString()
  cursor?: string;
}
