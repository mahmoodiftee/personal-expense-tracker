import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { AppLogger } from './core/logger/app-logger.service';

/**
 * Application entrypoint. Boots Nest with buffered logs, swaps in the structured
 * logger, and applies global HTTP conventions: URI API versioning, global
 * prefix, CORS from config, and graceful shutdown hooks.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // AppLogger is transient — resolve (not get) a dedicated instance.
  const logger = (await app.resolve(AppLogger)).setContext('Bootstrap');
  app.useLogger(logger);

  const config = app.get(AppConfigService);

  app.use(helmet());
  app.setGlobalPrefix(config.globalPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: config.defaultApiVersion });
  app.enableCors({ origin: config.corsOrigins, credentials: true });
  app.enableShutdownHooks();

  await app.listen(config.port);

  logger.log(
    `API ready on :${config.port} — routes under /${config.globalPrefix}/v${config.defaultApiVersion}`,
  );
}

void bootstrap();
