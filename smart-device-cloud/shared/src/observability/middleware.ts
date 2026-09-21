import type { Span, Context } from '@opentelemetry/api';
import { startRootSpan, recordException, endSpanWithError } from './tracer';
import type { ServiceMetrics } from './metrics';
import { recordRequest, recordError } from './metrics';
import { logger } from './logger';

export interface TraceableRequestOptions {
  spanName?: string;
  attributes?: Record<string, string | number | boolean>;
}

export async function traceableRequest<T>(
  fn: (span: Span) => Promise<T>,
  opts?: TraceableRequestOptions
): Promise<T> {
  const span = startRootSpan(opts?.spanName || 'request', opts?.attributes);
  try {
    const result = await fn(span);
    span.end();
    return result;
  } catch (err) {
    endSpanWithError(span, err);
    throw err;
  }
}

export function httpMiddleware(metrics?: ServiceMetrics) {
  return (
    req: { method: string; url: string; headers: Record<string, string> },
    res: { statusCode: number }
  ) => {
    if (metrics) {
      recordRequest(metrics, 0, { method: req.method, status: res.statusCode });
    }
  };
}

export function createRequestLogger(component: string) {
  return (msg: string, ctx: Record<string, unknown> = {}) => {
    logger.info(msg, { component, ...ctx });
  };
}

export { startRootSpan, recordException, endSpanWithError, recordRequest, recordError };
export type { Span, Context };
