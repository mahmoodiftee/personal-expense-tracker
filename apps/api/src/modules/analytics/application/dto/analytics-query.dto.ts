import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ForecastMethod } from '@finance/shared';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Shared range query for trend endpoints. */
export class AnalyticsRangeQueryDto {
  @IsMonthKey()
  from!: string;

  @IsMonthKey()
  to!: string;
}

/** Query for forecast analytics. */
export class ForecastAnalyticsQueryDto {
  @IsOptional()
  @IsMonthKey()
  asOf?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months: number = 3;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  lookback: number = 6;

  @IsOptional()
  @IsEnum(ForecastMethod)
  method: ForecastMethod = ForecastMethod.WMA;
}
