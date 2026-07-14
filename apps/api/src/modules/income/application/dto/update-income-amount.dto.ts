import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MoneyDto } from '../../../../common/dto/money.dto';
import { IsMonthKey } from '../../../../common/validation/is-month-key';

/** Payload to change an income source's amount from a given month onward. */
export class UpdateIncomeAmountDto {
  @ValidateNested()
  @Type(() => MoneyDto)
  amount!: MoneyDto;

  @IsMonthKey()
  effectiveFrom!: string;
}
