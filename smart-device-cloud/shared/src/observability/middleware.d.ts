import type { Span, Context } from '@opentelemetry/api';
import { startRootSpan, recordException, endSpanWithError } from './tracer';
import type { ServiceMetrics } from './metrics';
import { recordRequest, recordError } from './metrics';
export interface TraceableRequestOptions {
  spanName?: string;
  attributes?: Record<string, string | number | boolean>;
}
export declare function traceableRequest<T>(
  fn: (span: Span) => Promise<T>,
  opts?: TraceableRequestOptions
): Promise<T>;
export declare function httpMiddleware(metrics?: ServiceMetrics): (
  req: {
    method: string;
    url: string;
    headers: Record<string, string>;
  },
  res: {
    statusCode: number;
  }
) => void;
export declare function createRequestLogger(
  component: string
): (msg: string, ctx?: Record<string, unknown>) => void;
export { startRootSpan, recordException, endSpanWithError, recordRequest, recordError };
export type { Span, Context };
//# sourceMappingURL=middleware.d.ts.map
