import { Inject, Injectable } from '@nestjs/common';
import {
  CurrencyCode,
  Flow,
  type IncomeSource,
  type IncomeSummary,
  type IncomeSourceShare,
  type IncomeSummaryMonth,
  type Money,
  type MonthKey,
  type MonthlyIncome,
  type MonthlyIncomeSourceItem,
} from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import {
  DomainValidationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/app.exception';
import { round2 } from '../../../common/util/math.util';
import { reconcileCurrency } from '../../../common/domain/currency.util';
import { validateMonthRange } from '../../../common/validation/validate-month-range';
import {
  INCOME_SOURCE_REPOSITORY,
  type IncomeSourceRepositoryPort,
} from '../domain/income-source.repository.port';
import { effectiveAmountForMonth, isActiveInMonth } from '../domain/income.calculations';
import type { CreateIncomeSourceDto } from './dto/create-income-source.dto';
import type { UpdateIncomeSourceDto } from './dto/update-income-source.dto';
import type { UpdateIncomeAmountDto } from './dto/update-income-amount.dto';
import type { ListIncomeSourcesQueryDto } from './dto/income-query.dto';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../transactions/domain/transaction.repository.port';

/** Max months allowed in a single summary window (guards runaway ranges). */
const MAX_SUMMARY_MONTHS = 60;

/**
 * Income use cases: managing income sources and deriving monthly income and
 * summaries from their effective-dated amounts. Depends only on the repository
 * *port* and pure domain calculations (SRP, Dependency Inversion).
 */
@Injectable()
export class IncomeService {
  constructor(
    @Inject(INCOME_SOURCE_REPOSITORY)
    private readonly repository: IncomeSourceRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(IncomeService.name);
  }

  async createSource(userId: string, dto: CreateIncomeSourceDto): Promise<IncomeSource> {
    if (dto.endMonth && dto.endMonth < dto.startMonth) {
      throw new DomainValidationException('endMonth cannot be before startMonth');
    }

    const source = await this.repository.create({
      userId,
      name: dto.name,
      amount: { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency },
      cadence: dto.cadence,
      dueDay: dto.dueDay,
      startMonth: dto.startMonth,
      endMonth: dto.endMonth ?? null,
      categoryId: dto.categoryId ?? null,
    });

    this.logger.log(`Income source created: ${source.id} (${source.name}) [user ${userId}]`);
    return source;
  }

  listSources(userId: string, query: ListIncomeSourcesQueryDto): Promise<readonly IncomeSource[]> {
    return this.repository.findMany(userId, { status: query.status });
  }

  async getSource(userId: string, id: string): Promise<IncomeSource> {
    const source = await this.repository.findById(userId, id);
    if (!source) throw new ResourceNotFoundException('Income source', id);
    return source;
  }

  async updateSource(
    userId: string,
    id: string,
    dto: UpdateIncomeSourceDto,
  ): Promise<IncomeSource> {
    const updated = await this.repository.updateMeta(userId, id, {
      name: dto.name,
      dueDay: dto.dueDay,
      status: dto.status,
      endMonth: dto.endMonth,
      categoryId: dto.categoryId,
    });
    if (!updated) throw new ResourceNotFoundException('Income source', id);

    this.logger.log(`Income source updated: ${id} [user ${userId}]`);
    return updated;
  }

  async changeAmount(
    userId: string,
    id: string,
    dto: UpdateIncomeAmountDto,
  ): Promise<IncomeSource> {
    const updated = await this.repository.appendAmount(
      userId,
      id,
      { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency },
      dto.effectiveFrom,
    );
    if (!updated) throw new ResourceNotFoundException('Income source', id);

    this.logger.log(
      `Income source amount changed: ${id} from ${dto.effectiveFrom} [user ${userId}]`,
    );
    return updated;
  }

  async deleteSource(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.delete(userId, id);
    if (!deleted) throw new ResourceNotFoundException('Income source', id);
    this.logger.log(`Income source deleted: ${id} [user ${userId}]`);
  }

  /** Total expected income for a month, broken down by contributing source. */
  async getMonthlyIncome(userId: string, monthKey: MonthKey): Promise<MonthlyIncome> {
    const sources = await this.repository.findActiveInMonth(userId, monthKey);

    const items: MonthlyIncomeSourceItem[] = [];
    for (const source of sources) {
      const amount = effectiveAmountForMonth(source, monthKey);
      if (amount && amount.amountMinor > 0) {
        items.push({ sourceId: source.id, name: source.name, amount });
      }
    }

    const extraIncome = await this.transactions.findManyPaginated(
      userId,
      { flow: Flow.INCOME, adHocOnly: true, monthKey },
      { limit: 500 },
    );
    for (const tx of extraIncome.items) {
      if (tx.amount.amountMinor <= 0) continue;
      items.push({ sourceId: tx.id, name: tx.description, amount: tx.amount });
    }

    const total = this.sum(items.map((item) => item.amount));
    return { monthKey, currency: total.currency, total, sources: items };
  }

  /** Aggregated income across an inclusive month range. */
  async getSummary(userId: string, from: MonthKey, to: MonthKey): Promise<IncomeSummary> {
    const months = validateMonthRange(from, to, MAX_SUMMARY_MONTHS);

    const sources = await this.repository.findMany(userId);
    const perSourceTotals = new Map<string, { name: string; amountMinor: number }>();
    const monthlyTotals: IncomeSummaryMonth[] = [];
    let currency: CurrencyCode | null = null;
    let grandTotalMinor = 0;

    for (const monthKey of months) {
      let monthMinor = 0;
      for (const source of sources) {
        if (!isActiveInMonth(source, monthKey)) continue;
        const amount = effectiveAmountForMonth(source, monthKey);
        if (!amount || amount.amountMinor <= 0) continue;

        currency = reconcileCurrency(currency, amount.currency);
        monthMinor += amount.amountMinor;

        const existing = perSourceTotals.get(source.id);
        perSourceTotals.set(source.id, {
          name: source.name,
          amountMinor: (existing?.amountMinor ?? 0) + amount.amountMinor,
        });
      }
      grandTotalMinor += monthMinor;
      monthlyTotals.push({
        monthKey,
        total: { amountMinor: monthMinor, currency: currency ?? CurrencyCode.USD },
      });
    }

    const resolvedCurrency = currency ?? CurrencyCode.USD;
    const total: Money = { amountMinor: grandTotalMinor, currency: resolvedCurrency };
    const monthlyAverage: Money = {
      amountMinor: months.length ? Math.round(grandTotalMinor / months.length) : 0,
      currency: resolvedCurrency,
    };

    const bySource: IncomeSourceShare[] = [...perSourceTotals.entries()]
      .map(([sourceId, value]) => ({
        sourceId,
        name: value.name,
        total: { amountMinor: value.amountMinor, currency: resolvedCurrency },
        sharePct: grandTotalMinor ? round2((value.amountMinor / grandTotalMinor) * 100) : 0,
      }))
      .sort((a, b) => b.total.amountMinor - a.total.amountMinor);

    return {
      rangeStart: from,
      rangeEnd: to,
      currency: resolvedCurrency,
      total,
      monthlyAverage,
      months: monthlyTotals,
      bySource,
    };
  }

  /** Sums same-currency amounts; rejects mixed currencies (unsupported for now). */
  private sum(amounts: readonly Money[]): Money {
    if (amounts.length === 0) return { amountMinor: 0, currency: CurrencyCode.USD };
    let currency: CurrencyCode | null = null;
    let total = 0;
    for (const amount of amounts) {
      currency = reconcileCurrency(currency, amount.currency);
      total += amount.amountMinor;
    }
    return { amountMinor: total, currency: currency ?? CurrencyCode.USD };
  }
}
