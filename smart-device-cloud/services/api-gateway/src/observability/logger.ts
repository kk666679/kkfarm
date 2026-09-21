export interface LogContext {
  requestId?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
}

export function log(level: 'info' | 'warn' | 'error', msg: string, ctx: LogContext = {}) {
  console[level](JSON.stringify({ level, msg, ts: new Date().toISOString(), ...ctx }));
}
