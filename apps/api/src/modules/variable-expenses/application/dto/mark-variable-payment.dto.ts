import { IsISO8601, IsOptional } from 'class-validator';

/** Payload to mark a variable expense as paid. */
export class MarkVariableExpensePaidDto {
  @IsOptional()
  @IsISO8601()
  paidAt?: string;
}

/** Payload to mark a variable expense as unpaid (empty body allowed). */
export class MarkVariableExpenseUnpaidDto {}
