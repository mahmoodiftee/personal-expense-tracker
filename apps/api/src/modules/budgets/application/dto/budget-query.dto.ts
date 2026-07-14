import { IsOptional } from 'class-validator';

import { IsMonthKey } from '../../../../common/validation/is-month-key';

export class MonthlyBudgetQueryDto {
  @IsOptional()
  @IsMonthKey()
  month?: string;
}
