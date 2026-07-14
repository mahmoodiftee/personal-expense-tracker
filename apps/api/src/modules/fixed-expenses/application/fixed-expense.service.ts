import { Inject, Injectable } from '@nestjs/common';
import {
  CurrencyCode,
  type ExpenseShare,
  type ExpenseSummary,
  type ExpenseSummaryMonth,
  type FixedExpense,
  type FixedExpenseMonthlyStatusItem,
  type Money,
  type MonthKey,
  type MonthlyExpenseStatus,
  PaymentStatus,
} from '@finance/shared';
import { AppLogger } from '../../../core/logger/app-logger.service';
import {
  DomainValidationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/app.exception';
import {
  effectiveAmountForMonth,
  isActiveInMonth,
} from '../../../common/domain/recurring.calculations';
import { monthKeyRange } from '../../../common/util/month.util';
import {
  FIXED_EXPENSE_REPOSITORY,
  type FixedExpenseRepositoryPort,
} from '../domain/fixed-expense.repository.port';
import {
  EXPENSE_PAYMENT_REPOSITORY,
  type ExpensePaymentRecord,
  type ExpensePaymentRepositoryPort,
} from '../domain/expense-payment.repository.port';
import type { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import type { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import type { UpdateExpenseAmountDto } from './dto/update-expense-amount.dto';
import type { MarkPaidDto, MarkUnpaidDto } from './dto/mark-payment.dto';
import type { ListFixedExpensesQueryDto } from './dto/expense-query.dto';

/** Max months allowed in a single summary window (guards runaway ranges). */
const MAX_SUMMARY_MONTHS = 60;

/**
 * Fixed-expense use cases: managing recurring expenses and tracking their
 * monthly paid/unpaid status. Depends only on repository *ports* and pure
 * domain calculations (SRP, Dependency Inversion).
 */
@Injectable()
export class FixedExpenseService {
  constructor(
    @Inject(FIXED_EXPENSE_REPOSITORY)
    private readonly expenses: FixedExpenseRepositoryPort,
    @Inject(EXPENSE_PAYMENT_REPOSITORY)
    private readonly payments: ExpensePaymentRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(FixedExpenseService.name);
  }

  async createExpense(userId: string, dto: CreateFixedExpenseDto): Promise<FixedExpense> {
    if (dto.endMonth && dto.endMonth < dto.startMonth) {
      throw new DomainValidationException('endMonth cannot be before startMonth');
    }

    const expense = await this.expenses.create({
      userId,
      name: dto.name,
      amount: { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency },
      cadence: dto.cadence,
      dueDay: dto.dueDay,
      startMonth: dto.startMonth,
      endMonth: dto.endMonth ?? null,
      categoryId: dto.categoryId ?? null,
    });

    this.logger.log(`Fixed expense created: ${expense.id} (${expense.name}) [user ${userId}]`);
    return expense;
  }

  listExpenses(userId: string, query: ListFixedExpensesQueryDto): Promise<readonly FixedExpense[]> {
    return this.expenses.findMany(userId, { status: query.status });
  }

  async getExpense(userId: string, id: string): Promise<FixedExpense> {
    const expense = await this.expenses.findById(userId, id);
    if (!expense) throw new ResourceNotFoundException('Fixed expense', id);
    return expense;
  }

  async updateExpense(
    userId: string,
    id: string,
    dto: UpdateFixedExpenseDto,
  ): Promise<FixedExpense> {
    const updated = await this.expenses.updateMeta(userId, id, {
      name: dto.name,
      dueDay: dto.dueDay,
      status: dto.status,
      endMonth: dto.endMonth,
      categoryId: dto.categoryId,
    });
    if (!updated) throw new ResourceNotFoundException('Fixed expense', id);

    this.logger.log(`Fixed expense updated: ${id} [user ${userId}]`);
    return updated;
  }

  async changeAmount(
    userId: string,
    id: string,
    dto: UpdateExpenseAmountDto,
  ): Promise<FixedExpense> {
    const updated = await this.expenses.appendAmount(
      userId,
      id,
      { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency },
      dto.effectiveFrom,
    );
    if (!updated) throw new ResourceNotFoundException('Fixed expense', id);

    this.logger.log(
      `Fixed expense amount changed: ${id} from ${dto.effectiveFrom} [user ${userId}]`,
    );
    return updated;
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    const deleted = await this.expenses.delete(userId, id);
    if (!deleted) throw new ResourceNotFoundException('Fixed expense', id);
    await this.payments.deleteForPlan(userId, id);
    this.logger.log(`Fixed expense deleted: ${id} [user ${userId}]`);
  }

  /** Mark a fixed expense as paid for a month (idempotent). */
  async markPaid(
    userId: string,
    id: string,
    dto: MarkPaidDto,
  ): Promise<FixedExpenseMonthlyStatusItem> {
    const expense = await this.getExpense(userId, id);
    if (!isActiveInMonth(expense, dto.month)) {
      throw new DomainValidationException(`Fixed expense is not active in ${dto.month}`);
    }

    const amount =
      (dto.amount && { amountMinor: dto.amount.amountMinor, currency: dto.amount.currency }) ||
      effectiveAmountForMonth(expense, dto.month);
    if (!amount) {
      throw new DomainValidationException(`No amount is defined for ${dto.month}`);
    }

    const record = await this.payments.upsert({
      userId,
      planId: id,
      monthKey: dto.month,
      status: PaymentStatus.PAID,
      amount,
      paidAt: dto.paidAt ?? new Date().toISOString(),
    });

    this.logger.log(`Fixed expense marked PAID: ${id} for ${dto.month} [user ${userId}]`);
    return this.toStatusItem(expense, dto.month, record);
  }

  /** Mark a fixed expense as unpaid for a month (idempotent). */
  async markUnpaid(
    userId: string,
    id: string,
    dto: MarkUnpaidDto,
  ): Promise<FixedExpenseMonthlyStatusItem> {
    const expense = await this.getExpense(userId, id);
    const amount =
      effectiveAmountForMonth(expense, dto.month) ??
      ({ amountMinor: 0, currency: CurrencyCode.USD } as Money);

    const record = await this.payments.upsert({
      userId,
      planId: id,
      monthKey: dto.month,
      status: PaymentStatus.UNPAID,
      amount,
      paidAt: null,
    });

    this.logger.log(`Fixed expense marked UNPAID: ${id} for ${dto.month} [user ${userId}]`);
    return this.toStatusItem(expense, dto.month, record);
  }

  /** Paid/unpaid picture for every active fixed expense in a month. */
  async getMonthlyStatus(userId: string, monthKey: MonthKey): Promise<MonthlyExpenseStatus> {
    const [expenses, payments] = await Promise.all([
      this.expenses.findActiveInMonth(userId, monthKey),
      this.payments.findByMonth(userId, monthKey),
    ]);
    const paymentByPlan = new Map(payments.map((p) => [p.planId, p]));

    const items: FixedExpenseMonthlyStatusItem[] = [];
    let currency: CurrencyCode | null = null;
    let dueMinor = 0;
    let paidMinor = 0;
    let paidCount = 0;

    for (const expense of expenses) {
      const record = paymentByPlan.get(expense.id) ?? null;
      const item = this.toStatusItem(expense, monthKey, record);
      currency = this.reconcileCurrency(currency, item.amount.currency);
      dueMinor += item.amount.amountMinor;
      if (item.status === PaymentStatus.PAID) {
        paidMinor += item.amount.amountMinor;
        paidCount += 1;
      }
      items.push(item);
    }

    const resolvedCurrency = currency ?? CurrencyCode.USD;
    return {
      monthKey,
      currency: resolvedCurrency,
      totalDue: { amountMinor: dueMinor, currency: resolvedCurrency },
      totalPaid: { amountMinor: paidMinor, currency: resolvedCurrency },
      totalUnpaid: { amountMinor: dueMinor - paidMinor, currency: resolvedCurrency },
      paidCount,
      unpaidCount: items.length - paidCount,
      items,
    };
  }

  /** Aggregated due vs paid across an inclusive month range. */
  async getSummary(userId: string, from: MonthKey, to: MonthKey): Promise<ExpenseSummary> {
    if (from > to) {
      throw new DomainValidationException('`from` month must not be after `to` month');
    }

    const months = monthKeyRange(from, to, MAX_SUMMARY_MONTHS + 1);
    if (months.length > MAX_SUMMARY_MONTHS) {
      throw new DomainValidationException(
        `Summary range cannot exceed ${MAX_SUMMARY_MONTHS} months`,
      );
    }

    const [expenses, payments] = await Promise.all([
      this.expenses.findMany(userId),
      this.payments.findRange(userId, from, to),
    ]);
    const paidKey = (planId: string, month: MonthKey): string => `${planId}:${month}`;
    const paidByKey = new Map(
      payments
        .filter((p) => p.status === PaymentStatus.PAID)
        .map((p) => [paidKey(p.planId, p.monthKey), p]),
    );

    const perExpense = new Map<string, { name: string; dueMinor: number; paidMinor: number }>();
    const monthly: ExpenseSummaryMonth[] = [];
    let currency: CurrencyCode | null = null;
    let totalDueMinor = 0;
    let totalPaidMinor = 0;

    for (const monthKey of months) {
      let monthDue = 0;
      let monthPaid = 0;
      for (const expense of expenses) {
        if (!isActiveInMonth(expense, monthKey)) continue;
        const amount = effectiveAmountForMonth(expense, monthKey);
        if (!amount || amount.amountMinor <= 0) continue;

        currency = this.reconcileCurrency(currency, amount.currency);
        monthDue += amount.amountMinor;

        const isPaid = paidByKey.has(paidKey(expense.id, monthKey));
        const paidAmount = isPaid ? amount.amountMinor : 0;
        monthPaid += paidAmount;

        const existing = perExpense.get(expense.id);
        perExpense.set(expense.id, {
          name: expense.name,
          dueMinor: (existing?.dueMinor ?? 0) + amount.amountMinor,
          paidMinor: (existing?.paidMinor ?? 0) + paidAmount,
        });
      }
      totalDueMinor += monthDue;
      totalPaidMinor += monthPaid;
      monthly.push({
        monthKey,
        due: { amountMinor: monthDue, currency: currency ?? CurrencyCode.USD },
        paid: { amountMinor: monthPaid, currency: currency ?? CurrencyCode.USD },
      });
    }

    const resolvedCurrency = currency ?? CurrencyCode.USD;
    const byExpense: ExpenseShare[] = [...perExpense.entries()]
      .map(([expenseId, value]) => ({
        expenseId,
        name: value.name,
        totalDue: { amountMinor: value.dueMinor, currency: resolvedCurrency },
        totalPaid: { amountMinor: value.paidMinor, currency: resolvedCurrency },
        sharePct: totalDueMinor ? round2((value.dueMinor / totalDueMinor) * 100) : 0,
      }))
      .sort((a, b) => b.totalDue.amountMinor - a.totalDue.amountMinor);

    return {
      rangeStart: from,
      rangeEnd: to,
      currency: resolvedCurrency,
      totalDue: { amountMinor: totalDueMinor, currency: resolvedCurrency },
      totalPaid: { amountMinor: totalPaidMinor, currency: resolvedCurrency },
      months: monthly,
      byExpense,
    };
  }

  /** Builds the month status item for an expense from its (optional) payment record. */
  private toStatusItem(
    expense: FixedExpense,
    monthKey: MonthKey,
    record: ExpensePaymentRecord | null,
  ): FixedExpenseMonthlyStatusItem {
    const amount =
      record?.amount ??
      effectiveAmountForMonth(expense, monthKey) ??
      ({ amountMinor: 0, currency: CurrencyCode.USD } as Money);
    const status = record?.status ?? PaymentStatus.UNPAID;
    return {
      expenseId: expense.id,
      name: expense.name,
      dueDay: expense.dueDay,
      amount,
      status,
      paidAt: status === PaymentStatus.PAID ? (record?.paidAt ?? null) : null,
    };
  }

  private reconcileCurrency(current: CurrencyCode | null, next: CurrencyCode): CurrencyCode {
    if (current !== null && current !== next) {
      throw new DomainValidationException('Mixed currencies are not supported yet');
    }
    return next;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
