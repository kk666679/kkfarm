import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { config } from '../config/env';
let _tracer = null;
export function getTracer(serviceName) {
  if (_tracer) return _tracer;
  _tracer = trace.getTracer(serviceName || config.OTEL_SERVICE_NAME, '1.0.0');
  return _tracer;
}
export function startRootSpan(name, attributes) {
  const tracer = getTracer();
  return tracer.startSpan(name, { attributes }, context.active());
}
export function startSpanFromCtx(tracer, name, ctx, attributes) {
  return tracer.startSpan(name, { attributes }, ctx);
}
export function recordException(span, error, attributes) {
  if (error instanceof Error) {
    span.recordException(error);
    span.setAttribute('error', true);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  } else {
    span.setAttribute('error', true);
    span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
  }
  if (attributes) {
    span.setAttributes(attributes);
  }
}
export function injectTraceContext(span) {
  const carrier = {};
  trace.setSpan(context.active(), span);
  return carrier;
}
export function addSpanAttributes(span, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined) {
      span.setAttribute(key, value);
    }
  }
}
export function endSpanWithError(span, error) {
  recordException(span, error);
  span.end();
}
//# sourceMappingURL=tracer.js.map
