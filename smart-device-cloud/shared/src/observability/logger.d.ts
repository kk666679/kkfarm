type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
interface LogContext {
  traceId?: string;
  spanId?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
}
declare class Logger {
  private readonly level;
  private readonly isProduction;
  constructor(level?: LogLevel, isProduction?: boolean);
  private getTraceContext;
  private shouldLog;
  private format;
  private write;
  fatal(msg: string, ctx?: LogContext): void;
  error(msg: string, ctx?: LogContext): void;
  warn(msg: string, ctx?: LogContext): void;
  info(msg: string, ctx?: LogContext): void;
  debug(msg: string, ctx?: LogContext): void;
  trace(msg: string, ctx?: LogContext): void;
  child(ctx: LogContext): Logger;
}
export declare const logger: Logger;
export type { LogLevel, LogContext };
//# sourceMappingURL=logger.d.ts.map
