import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { IsMonthKey } from '../../../../common/validation/is-month-key';

export class ListInsightsQueryDto {
  @IsOptional()
  @IsMonthKey()
  month?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
