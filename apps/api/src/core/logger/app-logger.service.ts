import { Injectable, Scope, type LoggerService } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';

type LogLevelName = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/** Lower number = higher priority; used to filter by the configured threshold. */
const LEVEL_PRIORITY: Record<LogLevelName, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4,
};

interface LogEntry {
  level: LogLevelName;
  time: string;
  context?: string;
  message: string;
  trace?: string;
  meta?: Record<string, unknown>;
}

/**
 * Application logger. Emits structured JSON in production (machine-parseable for
 * log aggregation / OTel) and human-readable lines in development. Honours the
 * `LOG_LEVEL` config threshold. Transient scope lets each consumer own a
 * context label via {@link setContext}.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context?: string;
  private readonly threshold: number;
  private readonly asJson: boolean;

  constructor(private readonly config: AppConfigService) {
    this.threshold = LEVEL_PRIORITY[config.logLevel];
    this.asJson = config.isProduction;
  }

  setContext(context: string): this {
    this.context = context;
    return this;
  }

  log(message: unknown, context?: string): void {
    this.write('info', message, undefined, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', message, trace, context);
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, undefined, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, undefined, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('verbose', message, undefined, context);
  }

  private write(level: LogLevelName, message: unknown, trace?: string, context?: string): void {
    if (LEVEL_PRIORITY[level] > this.threshold) return;

    const { text, meta } = this.normalize(message);
    const entry: LogEntry = {
      level,
      time: new Date().toISOString(),
      context: context ?? this.context,
      message: text,
      ...(trace ? { trace } : {}),
      ...(meta ? { meta } : {}),
    };

    const line = this.asJson ? JSON.stringify(entry) : this.pretty(entry);
    const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
    stream.write(`${line}\n`);
  }

  /** Splits a message into a display string plus optional structured metadata. */
  private normalize(message: unknown): { text: string; meta?: Record<string, unknown> } {
    if (typeof message === 'string') return { text: message };
    if (message instanceof Error) return { text: message.message, meta: { name: message.name } };
    if (message && typeof message === 'object') {
      return { text: '[object]', meta: message as Record<string, unknown> };
    }
    return { text: String(message) };
  }

  private pretty(entry: LogEntry): string {
    const ctx = entry.context ? ` [${entry.context}]` : '';
    const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
    const trace = entry.trace ? `\n${entry.trace}` : '';
    return `${entry.time} ${entry.level.toUpperCase().padEnd(7)}${ctx} ${entry.message}${meta}${trace}`;
  }
}
