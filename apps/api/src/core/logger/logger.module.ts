import { Global, Module } from '@nestjs/common';
import { AppLogger } from './app-logger.service';

/**
 * Global logging module. Exports the transient {@link AppLogger} so any provider
 * can inject it and attach its own context label.
 */
@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
