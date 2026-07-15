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
import type { ExtraIncome } from '@finance/shared';
import type { Paginated } from '../../../common/domain/pagination';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { ExtraIncomeService } from '../application/extra-income.service';
import { CreateExtraIncomeDto } from '../application/dto/create-extra-income.dto';
import { ExtraIncomeQueryDto } from '../application/dto/extra-income-query.dto';
import { UpdateExtraIncomeDto } from '../application/dto/update-extra-income.dto';

@Controller({ path: 'extra-income', version: '1' })
export class ExtraIncomeController {
  constructor(private readonly service: ExtraIncomeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  add(@CurrentUserId() userId: string, @Body() dto: CreateExtraIncomeDto): Promise<ExtraIncome> {
    return this.service.add(userId, dto);
  }

  @Get()
  list(
    @CurrentUserId() userId: string,
    @Query() query: ExtraIncomeQueryDto,
  ): Promise<Paginated<ExtraIncome>> {
    return this.service.list(userId, query);
  }

  @Get(':id')
  get(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ExtraIncome> {
    return this.service.get(userId, id);
  }

  @Patch(':id')
  edit(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateExtraIncomeDto,
  ): Promise<ExtraIncome> {
    return this.service.edit(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ id: string; deleted: true }> {
    await this.service.delete(userId, id);
    return { id, deleted: true };
  }
}
