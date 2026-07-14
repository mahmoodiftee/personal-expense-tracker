import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MoneyDto } from '../../../../common/dto/money.dto';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Change a fixed expense's amount from a given month onward (history kept). */
export class UpdateExpenseAmountDto {
  @ValidateNested()
  @Type(() => MoneyDto)
  amount!: MoneyDto;

  @IsMonthKey()
  effectiveFrom!: string;
}
