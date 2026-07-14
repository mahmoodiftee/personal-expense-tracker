import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { MoneyDto } from '../../../../common/dto/money.dto';

export class UpdateCategoryBudgetDto {
  @ValidateNested()
  @Type(() => MoneyDto)
  limitAmount!: MoneyDto;
}
