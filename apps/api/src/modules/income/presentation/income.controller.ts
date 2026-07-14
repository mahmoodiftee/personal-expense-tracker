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
import type { IncomeSource, IncomeSummary, MonthlyIncome } from '@finance/shared';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { IncomeService } from '../application/income.service';
import { CreateIncomeSourceDto } from '../application/dto/create-income-source.dto';
import { UpdateIncomeSourceDto } from '../application/dto/update-income-source.dto';
import { UpdateIncomeAmountDto } from '../application/dto/update-income-amount.dto';
import {
  IncomeSummaryQueryDto,
  ListIncomeSourcesQueryDto,
  MonthlyIncomeQueryDto,
} from '../application/dto/income-query.dto';

/**
 * Income endpoints (v1). Thin HTTP layer: it validates input via DTOs, resolves
 * the tenant via {@link CurrentUserId}, and delegates to {@link IncomeService}.
 * Responses are wrapped in the success envelope by the global interceptor.
 */
@Controller({ path: 'income', version: '1' })
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  // --- Income sources ---

  @Post('sources')
  @HttpCode(HttpStatus.CREATED)
  createSource(
    @CurrentUserId() userId: string,
    @Body() dto: CreateIncomeSourceDto,
  ): Promise<IncomeSource> {
    return this.incomeService.createSource(userId, dto);
  }

  @Get('sources')
  listSources(
    @CurrentUserId() userId: string,
    @Query() query: ListIncomeSourcesQueryDto,
  ): Promise<readonly IncomeSource[]> {
    return this.incomeService.listSources(userId, query);
  }

  @Get('sources/:id')
  getSource(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<IncomeSource> {
    return this.incomeService.getSource(userId, id);
  }

  @Patch('sources/:id')
  updateSource(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateIncomeSourceDto,
  ): Promise<IncomeSource> {
    return this.incomeService.updateSource(userId, id, dto);
  }

  @Patch('sources/:id/amount')
  changeAmount(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateIncomeAmountDto,
  ): Promise<IncomeSource> {
    return this.incomeService.changeAmount(userId, id, dto);
  }

  @Delete('sources/:id')
  @HttpCode(HttpStatus.OK)
  async deleteSource(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ id: string; deleted: true }> {
    await this.incomeService.deleteSource(userId, id);
    return { id, deleted: true };
  }

  // --- Tracking & summary ---

  @Get('monthly')
  getMonthlyIncome(
    @CurrentUserId() userId: string,
    @Query() query: MonthlyIncomeQueryDto,
  ): Promise<MonthlyIncome> {
    return this.incomeService.getMonthlyIncome(userId, query.month);
  }

  @Get('summary')
  getSummary(
    @CurrentUserId() userId: string,
    @Query() query: IncomeSummaryQueryDto,
  ): Promise<IncomeSummary> {
    return this.incomeService.getSummary(userId, query.from, query.to);
  }
}
