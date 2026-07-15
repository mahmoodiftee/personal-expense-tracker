import { Inject, Injectable } from '@nestjs/common';
import { CategoryKind, Flow, type ExtraIncome, type Transaction } from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import {
  DomainValidationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/app.exception';
import type { Paginated } from '../../../common/domain/pagination';
import {
  TRANSACTION_REPOSITORY,
  type TransactionFilter,
  type TransactionRepositoryPort,
  type UpdateTransactionData,
} from '../../transactions/domain/transaction.repository.port';
import type { CreateExtraIncomeDto } from './dto/create-extra-income.dto';
import type { ExtraIncomeQueryDto } from './dto/extra-income-query.dto';
import type { UpdateExtraIncomeDto } from './dto/update-extra-income.dto';
import { toExtraIncome } from './extra-income.mapper';

/** Writable view of the update payload while we assemble a partial change set. */
type WritableTransactionUpdate = {
  -readonly [K in keyof UpdateTransactionData]: UpdateTransactionData[K];
};

const DEFAULT_CATEGORY = {
  name: 'Extra income',
  color: '#22c55e',
  icon: 'coins',
  kind: CategoryKind.FIXED,
} as const;

@Injectable()
export class ExtraIncomeService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ExtraIncomeService.name);
  }

  async add(userId: string, dto: CreateExtraIncomeDto): Promise<ExtraIncome> {
    const occurredAt = this.parseDate(dto.occurredAt);
    const tx = await this.transactions.create({
      userId,
      flow: Flow.INCOME,
      amount: { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency },
      categoryId: null,
      categorySnapshot: { ...DEFAULT_CATEGORY },
      description: dto.description,
      notes: dto.notes ?? null,
      tags: [],
      occurredAt,
    });

    this.logger.log(`Extra income added: ${tx.id} (${tx.description}) [user ${userId}]`);
    return toExtraIncome(tx);
  }

  async get(userId: string, id: string): Promise<ExtraIncome> {
    return toExtraIncome(await this.getOwnedOrThrow(userId, id));
  }

  async edit(userId: string, id: string, dto: UpdateExtraIncomeDto): Promise<ExtraIncome> {
    await this.getOwnedOrThrow(userId, id);

    const changes: WritableTransactionUpdate = {};
    if (dto.amount !== undefined) {
      changes.amount = { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency };
    }
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.notes !== undefined) changes.notes = dto.notes;
    if (dto.occurredAt !== undefined) changes.occurredAt = this.parseDate(dto.occurredAt);

    const updated = await this.transactions.update(userId, id, changes);
    if (!updated) throw new ResourceNotFoundException('Extra income', id);

    this.logger.log(`Extra income updated: ${id} [user ${userId}]`);
    return toExtraIncome(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getOwnedOrThrow(userId, id);
    const deleted = await this.transactions.delete(userId, id);
    if (!deleted) throw new ResourceNotFoundException('Extra income', id);
    this.logger.log(`Extra income deleted: ${id} [user ${userId}]`);
  }

  async list(userId: string, query: ExtraIncomeQueryDto): Promise<Paginated<ExtraIncome>> {
    const filter: TransactionFilter = {
      flow: Flow.INCOME,
      adHocOnly: true,
      monthKey: query.month,
    };

    const page = await this.transactions.findManyPaginated(userId, filter, {
      limit: query.limit,
    });

    return { ...page, items: page.items.map(toExtraIncome) };
  }

  private async getOwnedOrThrow(userId: string, id: string): Promise<Transaction> {
    const tx = await this.transactions.findById(userId, id);
    if (!tx || tx.flow !== Flow.INCOME || tx.recurringPlanId !== null) {
      throw new ResourceNotFoundException('Extra income', id);
    }
    return tx;
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new DomainValidationException(`Invalid date: ${value}`);
    }
    return date;
  }
}
