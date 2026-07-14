import { TransactionEntity, TransactionSchema } from './transaction.schema';

/**
 * Mongoose feature-registration tuple for the shared `transactions` collection.
 * Imported by {@link TransactionsModule} so the ledger schema is declared once.
 */
export const TRANSACTION_MODEL = {
  name: TransactionEntity.name,
  schema: TransactionSchema,
};
