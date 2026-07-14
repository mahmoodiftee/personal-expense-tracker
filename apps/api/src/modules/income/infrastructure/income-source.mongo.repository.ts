import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type HydratedDocument, type Model } from 'mongoose';
import { type IncomeSource, RecurringKind } from '@finance/shared';
import { RecurringPlanRepositoryBase } from '../../recurring-plans/infrastructure/recurring-plan.repository.base';
import { RecurringPlanEntity } from '../../recurring-plans/infrastructure/recurring-plan.schema';
import { toRecurringPlanView } from '../../recurring-plans/infrastructure/recurring-plan.mapper';
import type { IncomeSourceRepositoryPort } from '../domain/income-source.repository.port';

/**
 * Mongoose adapter for income sources. All persistence lives in the generic
 * {@link RecurringPlanRepositoryBase} (pinned to `kind = INCOME`); this class
 * only supplies the income-specific document→domain mapping.
 */
@Injectable()
export class IncomeSourceMongoRepository
  extends RecurringPlanRepositoryBase<IncomeSource>
  implements IncomeSourceRepositoryPort
{
  constructor(@InjectModel(RecurringPlanEntity.name) model: Model<RecurringPlanEntity>) {
    super(model, RecurringKind.INCOME);
  }

  protected toDomain(doc: HydratedDocument<RecurringPlanEntity>): IncomeSource {
    return toRecurringPlanView(doc);
  }
}
