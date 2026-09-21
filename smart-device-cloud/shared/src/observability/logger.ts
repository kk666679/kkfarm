import { trace } from '@opentelemetry/api';
import { config } from '../config/env';

type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LogContext {
  traceId?: string;
  spanId?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
}

class Logger {
  private readonly level: LogLevel;
  private readonly isProduction: boolean;

  constructor(
    level: LogLevel = config.LOG_LEVEL,
    isProduction: boolean = config.NODE_ENV === 'production'
  ) {
    this.level = level;
    this.isProduction = isProduction;
  }

  private getTraceContext(): { traceId?: string; spanId?: string } {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      return { traceId: spanContext.traceId, spanId: spanContext.spanId };
    }
    return {};
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private format(level: LogLevel, msg: string, ctx: LogContext): Record<string, unknown> {
    const trace = this.getTraceContext();
    return {
      timestamp: new Date().toISOString(),
      level,
      msg,
      ...trace,
      ...ctx,
    };
  }

  private write(level: LogLevel, msg: string, ctx: LogContext): void {
    if (!this.shouldLog(level)) return;
    const entry = this.format(level, msg, ctx);
    const line = this.isProduction ? JSON.stringify(entry) : JSON.stringify(entry, null, 2);
    if (level === 'error' || level === 'fatal') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  fatal(msg: string, ctx: LogContext = {}): void {
    this.write('fatal', msg, ctx);
  }
  error(msg: string, ctx: LogContext = {}): void {
    this.write('error', msg, ctx);
  }
  warn(msg: string, ctx: LogContext = {}): void {
    this.write('warn', msg, ctx);
  }
  info(msg: string, ctx: LogContext = {}): void {
    this.write('info', msg, ctx);
  }
  debug(msg: string, ctx: LogContext = {}): void {
    this.write('debug', msg, ctx);
  }
  trace(msg: string, ctx: LogContext = {}): void {
    this.write('trace', msg, ctx);
  }

  child(ctx: LogContext): Logger {
    const child = new Logger(this.level, this.isProduction);
    return new Proxy(child, {
      get(target, prop) {
        if (typeof target[prop as keyof Logger] === 'function') {
          return (msg: string, extra: LogContext = {}) =>
            (target[prop as keyof Logger] as (m: string, c: LogContext) => void)(msg, {
              ...ctx,
              ...extra,
            });
        }
        return target[prop as keyof Logger] as unknown;
      },
    });
  }
}

export const logger = new Logger();

export type { LogLevel, LogContext };
