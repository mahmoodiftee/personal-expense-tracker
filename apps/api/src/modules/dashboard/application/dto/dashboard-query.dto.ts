import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ForecastMethod } from '@finance/shared';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Query for the main dashboard overview (single month + forecast). */
export class DashboardQueryDto {
  /** Target month (defaults to the current month). */
  @IsOptional()
  @IsMonthKey()
  month?: string;

  /** Forecast horizon in months. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  forecastMonths: number = 3;

  /** Months of history to fit the forecast on. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  forecastLookback: number = 6;

  @IsOptional()
  @IsEnum(ForecastMethod)
  forecastMethod: ForecastMethod = ForecastMethod.WMA;
}

/** Query for the multi-month trend overview. */
export class DashboardMonthlyOverviewQueryDto {
  @IsMonthKey()
  from!: string;

  @IsMonthKey()
  to!: string;
}
