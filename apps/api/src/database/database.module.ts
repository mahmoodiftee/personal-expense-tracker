import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppConfigService } from '../config/app-config.service';
import { AppLogger } from '../core/logger/app-logger.service';

/**
 * Global database module. Establishes the Mongoose connection from validated
 * config and wires connection lifecycle events into the structured logger so
 * operational state (connect/disconnect/error) is observable.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfigService, AppLogger],
      useFactory: (config: AppConfigService, logger: AppLogger) => {
        logger.setContext('Database');
        return {
          uri: config.database.uri,
          dbName: config.database.dbName,
          // Fail fast if the primary is unreachable rather than buffering forever.
          serverSelectionTimeoutMS: 10_000,
          connectionFactory: (connection: Connection): Connection => {
            connection.on('connected', () => logger.log('MongoDB connection established'));
            connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
            connection.on('reconnected', () => logger.log('MongoDB reconnected'));
            connection.on('error', (error: Error) =>
              logger.error(`MongoDB connection error: ${error.message}`, error.stack),
            );
            return connection;
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
