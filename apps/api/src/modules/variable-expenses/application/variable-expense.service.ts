import { Inject, Injectable } from '@nestjs/common';
import {
  type CategorySnapshot,
  CategoryKind,
  Flow,
  type Transaction,
  type VariableExpense,
} from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import {
  DomainValidationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/app.exception';
import type { Paginated } from '../../../common/domain/pagination';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepositoryPort,
} from '../../categories/domain/category.repository.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionFilter,
  type TransactionRepositoryPort,
  type UpdateTransactionData,
} from '../../transactions/domain/transaction.repository.port';
import type { CreateVariableExpenseDto } from './dto/create-variable-expense.dto';
import type { UpdateVariableExpenseDto } from './dto/update-variable-expense.dto';
import type { VariableExpenseQueryDto } from './dto/variable-expense-query.dto';
import type { CategoryInputDto } from './dto/category-input.dto';
import { toVariableExpense } from './variable-expense.mapper';

/** Writable view of the update payload while we assemble a partial change set. */
type WritableTransactionUpdate = {
  -readonly [K in keyof UpdateTransactionData]: UpdateTransactionData[K];
};

/** Defaults for a dynamic category when the caller omits colour/icon. */
const DEFAULT_CATEGORY_COLOR = '#64748b';
const DEFAULT_CATEGORY_ICON = 'tag';
const UNCATEGORISED_NAME = 'Uncategorized';

/**
 * Variable-expense use cases over the shared transactions ledger. Every read and
 * write is constrained to ad-hoc expenses (`flow = EXPENSE`, no recurring plan),
 * so this feature can never touch income or materialised fixed-expense rows.
 */
@Injectable()
export class VariableExpenseService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(VariableExpenseService.name);
  }

  async addExpense(userId: string, dto: CreateVariableExpenseDto): Promise<VariableExpense> {
    const occurredAt = this.parseDate(dto.occurredAt);
    const resolved = await this.resolveCategory(userId, dto.categoryId, dto.category);

    const tx = await this.transactions.create({
      userId,
      flow: Flow.EXPENSE,
      amount: { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency },
      categoryId: resolved.categoryId,
      categorySnapshot: resolved.snapshot,
      description: dto.description,
      notes: dto.notes ?? null,
      tags: dto.tags ?? [],
      occurredAt,
    });

    this.logger.log(`Variable expense added: ${tx.id} (${tx.description}) [user ${userId}]`);
    return toVariableExpense(tx);
  }

  async getExpense(userId: string, id: string): Promise<VariableExpense> {
    return toVariableExpense(await this.getOwnedExpenseOrThrow(userId, id));
  }

  async editExpense(
    userId: string,
    id: string,
    dto: UpdateVariableExpenseDto,
  ): Promise<VariableExpense> {
    const existing = await this.getOwnedExpenseOrThrow(userId, id);

    const changes: WritableTransactionUpdate = {};
    if (dto.amount !== undefined) {
      changes.amount = { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency };
    }
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.notes !== undefined) changes.notes = dto.notes;
    if (dto.tags !== undefined) changes.tags = dto.tags;
    if (dto.occurredAt !== undefined) changes.occurredAt = this.parseDate(dto.occurredAt);

    if (dto.categoryId !== undefined) {
      const resolved = await this.resolveCategory(userId, dto.categoryId, dto.category);
      changes.categoryId = resolved.categoryId;
      changes.categorySnapshot = resolved.snapshot;
    } else if (dto.category !== undefined) {
      changes.categoryId = null;
      changes.categorySnapshot = this.buildSnapshot(dto.category, existing.categorySnapshot);
    }

    const updated = await this.transactions.update(userId, id, changes);
    if (!updated) throw new ResourceNotFoundException('Variable expense', id);

    this.logger.log(`Variable expense updated: ${id} [user ${userId}]`);
    return toVariableExpense(updated);
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    await this.getOwnedExpenseOrThrow(userId, id);
    const deleted = await this.transactions.delete(userId, id);
    if (!deleted) throw new ResourceNotFoundException('Variable expense', id);
    this.logger.log(`Variable expense deleted: ${id} [user ${userId}]`);
  }

  /** Paginated, filterable expense history (newest first). */
  async listExpenses(
    userId: string,
    query: VariableExpenseQueryDto,
  ): Promise<Paginated<VariableExpense>> {
    if (query.from && query.to && query.from > query.to) {
      throw new DomainValidationException('`from` must not be after `to`');
    }
    if (
      query.minAmountMinor != null &&
      query.maxAmountMinor != null &&
      query.minAmountMinor > query.maxAmountMinor
    ) {
      throw new DomainValidationException('`minAmountMinor` must not exceed `maxAmountMinor`');
    }

    const filter: TransactionFilter = {
      flow: Flow.EXPENSE,
      adHocOnly: true,
      monthKey: query.month,
      from: query.from ? this.parseDate(query.from) : undefined,
      to: query.to ? this.parseDate(query.to) : undefined,
      search: query.q,
      tags: query.tags,
      amountMinMinor: query.minAmountMinor,
      amountMaxMinor: query.maxAmountMinor,
    };

    const page = await this.transactions.findManyPaginated(userId, filter, {
      cursor: query.cursor,
      limit: query.limit,
    });

    return { ...page, items: page.items.map(toVariableExpense) };
  }

  /** Loads a transaction and asserts it is an ad-hoc variable expense. */
  private async getOwnedExpenseOrThrow(userId: string, id: string): Promise<Transaction> {
    const tx = await this.transactions.findById(userId, id);
    if (!tx || tx.flow !== Flow.EXPENSE || tx.recurringPlanId !== null) {
      throw new ResourceNotFoundException('Variable expense', id);
    }
    return tx;
  }

  private async resolveCategory(
    userId: string,
    categoryId?: string,
    inline?: CategoryInputDto,
  ): Promise<{ categoryId: string | null; snapshot: CategorySnapshot }> {
    if (categoryId) {
      const category = await this.categories.findById(userId, categoryId);
      if (!category) throw new ResourceNotFoundException('Category', categoryId);
      if (category.flow !== Flow.EXPENSE || category.kind !== CategoryKind.VARIABLE) {
        throw new DomainValidationException('Category must be a variable expense category');
      }
      if (category.isArchived) {
        throw new DomainValidationException('Cannot assign an archived category');
      }

      return {
        categoryId: category.id,
        snapshot: {
          name: category.name,
          color: category.color,
          icon: category.icon,
          kind: category.kind,
        },
      };
    }

    return {
      categoryId: null,
      snapshot: this.buildSnapshot(inline),
    };
  }

  private buildSnapshot(
    category?: CategoryInputDto,
    fallback?: CategorySnapshot,
  ): CategorySnapshot {
    return {
      name: category?.name ?? fallback?.name ?? UNCATEGORISED_NAME,
      color: category?.color ?? fallback?.color ?? DEFAULT_CATEGORY_COLOR,
      icon: category?.icon ?? fallback?.icon ?? DEFAULT_CATEGORY_ICON,
      kind: CategoryKind.VARIABLE,
    };
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new DomainValidationException(`Invalid date: ${value}`);
    }
    return date;
  }
}
