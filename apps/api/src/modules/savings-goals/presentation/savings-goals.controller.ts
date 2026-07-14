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
import type { SavingsGoalWithProgress, SavingsGoalsOverview } from '@finance/shared';

import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { SavingsGoalsService } from '../application/savings-goals.service';
import { CreateSavingsGoalDto } from '../application/dto/create-savings-goal.dto';
import { SavingsGoalsOverviewQueryDto } from '../application/dto/savings-goals-query.dto';
import { UpdateSavingsGoalDto } from '../application/dto/update-savings-goal.dto';

@Controller({ path: 'savings-goals', version: '1' })
export class SavingsGoalsController {
  constructor(private readonly service: SavingsGoalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createGoal(
    @CurrentUserId() userId: string,
    @Body() dto: CreateSavingsGoalDto,
  ): Promise<SavingsGoalWithProgress> {
    return this.service.createGoal(userId, dto);
  }

  @Get()
  listGoals(
    @CurrentUserId() userId: string,
    @Query() query: SavingsGoalsOverviewQueryDto,
  ): Promise<SavingsGoalsOverview> {
    return this.service.listGoals(userId, query);
  }

  @Get(':id')
  getGoal(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: SavingsGoalsOverviewQueryDto,
  ): Promise<SavingsGoalWithProgress> {
    return this.service.getGoal(userId, id, query.asOf);
  }

  @Patch(':id')
  updateGoal(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoalWithProgress> {
    return this.service.updateGoal(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteGoal(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ id: string; deleted: true }> {
    await this.service.deleteGoal(userId, id);
    return { id, deleted: true };
  }
}
