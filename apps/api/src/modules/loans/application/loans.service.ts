import { Inject, Injectable } from '@nestjs/common';
import type { LoansOverview, MonthKey } from '@finance/shared';
import { PlanSubtype } from '@finance/shared';

import { currentMonthKey } from '../../../common/util/month.util';
import {
  EXPENSE_PAYMENT_REPOSITORY,
  type ExpensePaymentRepositoryPort,
} from '../../fixed-expenses/domain/expense-payment.repository.port';
import {
  FIXED_EXPENSE_REPOSITORY,
  type FixedExpenseRepositoryPort,
} from '../../fixed-expenses/domain/fixed-expense.repository.port';
import { buildLoansOverview } from './loan-progress.engine';

@Injectable()
export class LoansService {
  constructor(
    @Inject(FIXED_EXPENSE_REPOSITORY)
    private readonly expenses: FixedExpenseRepositoryPort,
    @Inject(EXPENSE_PAYMENT_REPOSITORY)
    private readonly payments: ExpensePaymentRepositoryPort,
  ) {}

  async getOverview(userId: string, asOf?: MonthKey): Promise<LoansOverview> {
    const asOfMonth = asOf ?? currentMonthKey();
    const loans = await this.expenses.findMany(userId, { planSubtype: PlanSubtype.LOAN });

    if (loans.length === 0) {
      return buildLoansOverview([], [], asOfMonth);
    }

    const earliestStart = loans.reduce<MonthKey>(
      (min, loan) => (loan.startMonth < min ? loan.startMonth : min),
      loans[0]!.startMonth,
    );
    const paymentRecords = await this.payments.findRange(userId, earliestStart, asOfMonth);

    return buildLoansOverview(loans, paymentRecords, asOfMonth);
  }
}
