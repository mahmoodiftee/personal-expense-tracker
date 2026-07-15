import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../common/domain/pagination';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

export class ExtraIncomeQueryDto {
  @IsOptional()
  @IsMonthKey()
  month?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = DEFAULT_PAGE_SIZE;
}
