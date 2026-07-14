import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ForecastMethod } from '@finance/shared';

import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Query for the composed financial context overview. */
export class AnalyticsOverviewQueryDto {
  @IsOptional()
  @IsMonthKey()
  month?: string;

  /** Number of months ending at `month` included in trends. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  trendMonths: number = 6;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  forecastMonths: number = 3;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  forecastLookback: number = 6;

  @IsOptional()
  @IsEnum(ForecastMethod)
  forecastMethod: ForecastMethod = ForecastMethod.WMA;

  /** Max categories returned in the overview context. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  topCategoriesLimit: number = 5;
}
