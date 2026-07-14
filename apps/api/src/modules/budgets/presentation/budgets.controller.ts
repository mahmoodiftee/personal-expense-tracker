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
import type { BudgetAnalytics, CategoryBudget, MonthlyBudgetSummary } from '@finance/shared';

import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { BudgetsService } from '../application/budgets.service';
import { MonthlyBudgetQueryDto } from '../application/dto/budget-query.dto';
import { CreateCategoryBudgetDto } from '../application/dto/create-category-budget.dto';
import { UpdateCategoryBudgetDto } from '../application/dto/update-category-budget.dto';

@Controller({ path: 'budgets', version: '1' })
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBudget(
    @CurrentUserId() userId: string,
    @Body() dto: CreateCategoryBudgetDto,
  ): Promise<CategoryBudget> {
    return this.service.createBudget(userId, dto);
  }

  @Get()
  getMonthlySummary(
    @CurrentUserId() userId: string,
    @Query() query: MonthlyBudgetQueryDto,
  ): Promise<MonthlyBudgetSummary> {
    return this.service.getMonthlySummary(userId, query.month);
  }

  @Get('analytics')
  getBudgetAnalytics(
    @CurrentUserId() userId: string,
    @Query() query: MonthlyBudgetQueryDto,
  ): Promise<BudgetAnalytics> {
    return this.service.getBudgetAnalytics(userId, query.month);
  }

  @Patch(':id')
  updateBudget(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCategoryBudgetDto,
  ): Promise<CategoryBudget> {
    return this.service.updateBudget(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteBudget(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ id: string; deleted: true }> {
    await this.service.deleteBudget(userId, id);
    return { id, deleted: true };
  }
}
