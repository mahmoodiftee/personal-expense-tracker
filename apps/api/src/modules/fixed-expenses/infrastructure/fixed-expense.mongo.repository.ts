import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type HydratedDocument, type Model } from 'mongoose';
import { type FixedExpense, RecurringKind } from '@finance/shared';
import { RecurringPlanRepositoryBase } from '../../recurring-plans/infrastructure/recurring-plan.repository.base';
import { RecurringPlanEntity } from '../../recurring-plans/infrastructure/recurring-plan.schema';
import { toRecurringPlanView } from '../../recurring-plans/infrastructure/recurring-plan.mapper';
import type { FixedExpenseRepositoryPort } from '../domain/fixed-expense.repository.port';

/**
 * Mongoose adapter for fixed expenses. Persistence is inherited from the generic
 * {@link RecurringPlanRepositoryBase} (pinned to `kind = FIXED_EXPENSE`); only
 * the domain mapping is fixed-expense specific.
 */
@Injectable()
export class FixedExpenseMongoRepository
  extends RecurringPlanRepositoryBase<FixedExpense>
  implements FixedExpenseRepositoryPort
{
  constructor(@InjectModel(RecurringPlanEntity.name) model: Model<RecurringPlanEntity>) {
    super(model, RecurringKind.FIXED_EXPENSE);
  }

  protected toDomain(doc: HydratedDocument<RecurringPlanEntity>): FixedExpense {
    return toRecurringPlanView(doc);
  }
}
