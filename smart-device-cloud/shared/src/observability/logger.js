import { trace } from '@opentelemetry/api';
import { config } from '../config/env';
class Logger {
  level;
  isProduction;
  constructor(level = config.LOG_LEVEL, isProduction = config.NODE_ENV === 'production') {
    this.level = level;
    this.isProduction = isProduction;
  }
  getTraceContext() {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      return { traceId: spanContext.traceId, spanId: spanContext.spanId };
    }
    return {};
  }
  shouldLog(level) {
    const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }
  format(level, msg, ctx) {
    const trace = this.getTraceContext();
    return {
      timestamp: new Date().toISOString(),
      level,
      msg,
      ...trace,
      ...ctx,
    };
  }
  write(level, msg, ctx) {
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
  fatal(msg, ctx = {}) {
    this.write('fatal', msg, ctx);
  }
  error(msg, ctx = {}) {
    this.write('error', msg, ctx);
  }
  warn(msg, ctx = {}) {
    this.write('warn', msg, ctx);
  }
  info(msg, ctx = {}) {
    this.write('info', msg, ctx);
  }
  debug(msg, ctx = {}) {
    this.write('debug', msg, ctx);
  }
  trace(msg, ctx = {}) {
    this.write('trace', msg, ctx);
  }
  child(ctx) {
    const child = new Logger(this.level, this.isProduction);
    return new Proxy(child, {
      get(target, prop) {
        if (typeof target[prop] === 'function') {
          return (msg, extra = {}) => target[prop](msg, { ...ctx, ...extra });
        }
        return target[prop];
      },
    });
  }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map
