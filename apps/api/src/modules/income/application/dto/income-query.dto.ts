import { IsEnum, IsOptional } from 'class-validator';
import { RecurringStatus } from '@finance/shared';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Query for listing income sources. */
export class ListIncomeSourcesQueryDto {
  @IsOptional()
  @IsEnum(RecurringStatus)
  status?: RecurringStatus;
}

/** Query for monthly income tracking. */
export class MonthlyIncomeQueryDto {
  @IsMonthKey()
  month!: string;
}

/** Query for the income summary over a month range. */
export class IncomeSummaryQueryDto {
  @IsMonthKey()
  from!: string;

  @IsMonthKey()
  to!: string;
}
