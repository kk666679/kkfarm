import { startRootSpan, recordException, endSpanWithError } from './tracer';
import { recordRequest, recordError } from './metrics';
import { logger } from './logger';
export async function traceableRequest(fn, opts) {
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
export function httpMiddleware(metrics) {
  return (req, res) => {
    if (metrics) {
      recordRequest(metrics, 0, { method: req.method, status: res.statusCode });
    }
  };
}
export function createRequestLogger(component) {
  return (msg, ctx = {}) => {
    logger.info(msg, { component, ...ctx });
  };
}
export { startRootSpan, recordException, endSpanWithError, recordRequest, recordError };
//# sourceMappingURL=middleware.js.map
