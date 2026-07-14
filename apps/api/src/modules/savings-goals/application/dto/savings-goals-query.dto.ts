import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { IsMonthKey } from '../../../../common/validation/is-month-key';

export class SavingsGoalsOverviewQueryDto {
  @IsOptional()
  @IsMonthKey()
  asOf?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  lookbackMonths: number = 6;
}
