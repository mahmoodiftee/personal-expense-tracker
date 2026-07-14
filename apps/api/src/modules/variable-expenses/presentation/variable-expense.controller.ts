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
import type { VariableExpense } from '@finance/shared';
import type { Paginated } from '../../../common/domain/pagination';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { VariableExpenseService } from '../application/variable-expense.service';
import { CreateVariableExpenseDto } from '../application/dto/create-variable-expense.dto';
import { UpdateVariableExpenseDto } from '../application/dto/update-variable-expense.dto';
import { VariableExpenseQueryDto } from '../application/dto/variable-expense-query.dto';

/**
 * Variable-expense endpoints (v1). Thin HTTP layer: validates input via DTOs,
 * resolves the tenant via {@link CurrentUserId}, and delegates to
 * {@link VariableExpenseService}. The list feed returns a paginated result that
 * the global interceptor lifts into `meta.pagination`.
 */
@Controller({ path: 'variable-expenses', version: '1' })
export class VariableExpenseController {
  constructor(private readonly service: VariableExpenseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  add(
    @CurrentUserId() userId: string,
    @Body() dto: CreateVariableExpenseDto,
  ): Promise<VariableExpense> {
    return this.service.addExpense(userId, dto);
  }

  @Get()
  list(
    @CurrentUserId() userId: string,
    @Query() query: VariableExpenseQueryDto,
  ): Promise<Paginated<VariableExpense>> {
    return this.service.listExpenses(userId, query);
  }

  @Get(':id')
  get(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<VariableExpense> {
    return this.service.getExpense(userId, id);
  }

  @Patch(':id')
  edit(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateVariableExpenseDto,
  ): Promise<VariableExpense> {
    return this.service.editExpense(userId, id, dto);
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
}
