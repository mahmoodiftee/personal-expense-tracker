import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from './env.validation';

/**
 * Typed, intention-revealing façade over `ConfigService`. Feature code depends
 * on this — never on raw `process.env` or stringly-typed keys — so config
 * access is type-safe, centralised, and easy to mock in tests.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  private get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config.get(key, { infer: true });
  }

  get nodeEnv(): EnvConfig['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get port(): number {
    return this.get('PORT');
  }

  get globalPrefix(): string {
    return this.get('API_GLOBAL_PREFIX');
  }

  get defaultApiVersion(): string {
    return this.get('API_DEFAULT_VERSION');
  }

  /** Parsed CORS allow-list. */
  get corsOrigins(): string[] {
    return this.get('CORS_ORIGINS')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get database(): { uri: string; dbName: string } {
    return { uri: this.get('MONGODB_URI'), dbName: this.get('MONGODB_DB_NAME') };
  }

  get logLevel(): EnvConfig['LOG_LEVEL'] {
    return this.get('LOG_LEVEL');
  }

  get ai(): { provider?: string; apiKey?: string } {
    return { provider: this.get('AI_PROVIDER'), apiKey: this.get('AI_API_KEY') };
  }
}
