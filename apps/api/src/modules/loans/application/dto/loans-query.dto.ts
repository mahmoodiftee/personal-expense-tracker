import { IsOptional } from 'class-validator';

import { IsMonthKey } from '../../../../common/validation/is-month-key';

export class LoansOverviewQueryDto {
  @IsOptional()
  @IsMonthKey()
  asOf?: string;
}
