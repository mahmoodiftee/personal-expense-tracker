import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type {
  ExpenseSummary,
  FixedExpense,
  FixedExpenseMonthlyStatusItem,
  MonthlyExpenseStatus,
} from '@finance/shared';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { FixedExpenseService } from '../application/fixed-expense.service';
import { CreateFixedExpenseDto } from '../application/dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from '../application/dto/update-fixed-expense.dto';
import { UpdateExpenseAmountDto } from '../application/dto/update-expense-amount.dto';
import { MarkPaidDto, MarkUnpaidDto } from '../application/dto/mark-payment.dto';
import {
  ExpenseSummaryQueryDto,
  ListFixedExpensesQueryDto,
  MonthlyExpenseStatusQueryDto,
} from '../application/dto/expense-query.dto';

/**
 * Fixed-expense endpoints (v1). Thin HTTP layer: validates input via DTOs,
 * resolves the tenant via {@link CurrentUserId}, and delegates to
 * {@link FixedExpenseService}. Static routes precede `:id` to avoid capture.
 */
@Controller({ path: 'fixed-expenses', version: '1' })
export class FixedExpenseController {
  constructor(private readonly service: FixedExpenseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateFixedExpenseDto,
  ): Promise<FixedExpense> {
    return this.service.createExpense(userId, dto);
  }

  @Get()
  list(
    @CurrentUserId() userId: string,
    @Query() query: ListFixedExpensesQueryDto,
  ): Promise<readonly FixedExpense[]> {
    return this.service.listExpenses(userId, query);
  }

  // --- Tracking & summary (static paths declared before ':id') ---

  @Get('monthly')
  getMonthlyStatus(
    @CurrentUserId() userId: string,
    @Query() query: MonthlyExpenseStatusQueryDto,
  ): Promise<MonthlyExpenseStatus> {
    return this.service.getMonthlyStatus(userId, query.month);
  }

  @Get('summary')
  getSummary(
    @CurrentUserId() userId: string,
    @Query() query: ExpenseSummaryQueryDto,
  ): Promise<ExpenseSummary> {
    return this.service.getSummary(userId, query.from, query.to);
  }

  @Get(':id')
  get(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<FixedExpense> {
    return this.service.getExpense(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateFixedExpenseDto,
  ): Promise<FixedExpense> {
    return this.service.updateExpense(userId, id, dto);
  }

  @Patch(':id/amount')
  changeAmount(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateExpenseAmountDto,
  ): Promise<FixedExpense> {
    return this.service.changeAmount(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ id: string; deleted: true }> {
    await this.service.deleteExpense(userId, id);
    return { id, deleted: true };
  }

  // --- Payment status ---

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  markPaid(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: MarkPaidDto,
  ): Promise<FixedExpenseMonthlyStatusItem> {
    return this.service.markPaid(userId, id, dto);
  }

  @Post(':id/unpay')
  @HttpCode(HttpStatus.OK)
  markUnpaid(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: MarkUnpaidDto,
  ): Promise<FixedExpenseMonthlyStatusItem> {
    return this.service.markUnpaid(userId, id, dto);
  }
}
