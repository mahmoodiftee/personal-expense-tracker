import { IsEnum, IsOptional } from 'class-validator';
import { RecurringStatus } from '@finance/shared';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Query for listing fixed expenses. */
export class ListFixedExpensesQueryDto {
  @IsOptional()
  @IsEnum(RecurringStatus)
  status?: RecurringStatus;
}

/** Query for monthly fixed-expense payment status. */
export class MonthlyExpenseStatusQueryDto {
  @IsMonthKey()
  month!: string;
}

/** Query for the fixed-expense summary over a month range. */
export class ExpenseSummaryQueryDto {
  @IsMonthKey()
  from!: string;

  @IsMonthKey()
  to!: string;
}
