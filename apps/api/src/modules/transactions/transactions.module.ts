import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TRANSACTION_REPOSITORY } from './domain/transaction.repository.port';
import { TRANSACTION_MODEL } from './infrastructure/transaction.model';
import { TransactionMongoRepository } from './infrastructure/transaction.mongo.repository';

/**
 * Shared transactions (ledger) module. Registers the `transactions` schema and
 * binds the repository *port* to its Mongoose adapter, then exports the port so
 * feature modules (variable expenses, analytics, dashboard) consume the ledger
 * without owning its persistence (Repository Pattern + Dependency Inversion).
 */
@Module({
  imports: [MongooseModule.forFeature([TRANSACTION_MODEL])],
  providers: [{ provide: TRANSACTION_REPOSITORY, useClass: TransactionMongoRepository }],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}
