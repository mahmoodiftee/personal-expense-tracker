import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ForecastMethod } from '@finance/shared';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Query for a single month's savings calculation. */
export class MonthlySavingsQueryDto {
  @IsMonthKey()
  month!: string;
}

/** Query for savings history over an inclusive month range. */
export class SavingsHistoryQueryDto {
  @IsMonthKey()
  from!: string;

  @IsMonthKey()
  to!: string;
}

/** Query for a forward-looking savings projection. */
export class SavingsProjectionQueryDto {
  /** Months to project into the future (horizon). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months: number = 3;

  /** Months of history to fit the forecast on. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  lookback: number = 6;

  @IsOptional()
  @IsEnum(ForecastMethod)
  method: ForecastMethod = ForecastMethod.WMA;

  /** Reference month the projection starts after (defaults to the current month). */
  @IsOptional()
  @IsMonthKey()
  asOf?: string;
}
