import { Type } from 'class-transformer';
import { IsMongoId, ValidateNested } from 'class-validator';

import { MoneyDto } from '../../../../common/dto/money.dto';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

export class CreateCategoryBudgetDto {
  @IsMonthKey()
  month!: string;

  @IsMongoId()
  categoryId!: string;

  @ValidateNested()
  @Type(() => MoneyDto)
  limitAmount!: MoneyDto;
}
