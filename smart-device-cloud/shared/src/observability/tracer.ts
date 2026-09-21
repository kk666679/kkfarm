import {
  trace,
  context,
  SpanStatusCode,
  type Tracer,
  type Span,
  type Attributes,
  type Context,
} from '@opentelemetry/api';
import { config } from '../config/env';

let _tracer: Tracer | null = null;

export function getTracer(serviceName?: string): Tracer {
  if (_tracer) return _tracer;
  _tracer = trace.getTracer(serviceName || config.OTEL_SERVICE_NAME, '1.0.0');
  return _tracer;
}

export function startRootSpan(name: string, attributes?: Attributes): Span {
  const tracer = getTracer();
  return tracer.startSpan(name, { attributes }, context.active());
}

export function startSpanFromCtx(
  tracer: Tracer,
  name: string,
  ctx?: Context,
  attributes?: Attributes
): Span {
  return tracer.startSpan(name, { attributes }, ctx);
}

export function recordException(span: Span, error: Error | unknown, attributes?: Attributes): void {
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

export function injectTraceContext(span: Span): Record<string, string> {
  const carrier: Record<string, string> = {};
  trace.setSpan(context.active(), span);
  return carrier;
}

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

export function addSpanAttributes(span: Span, attrs: SpanAttributes): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined) {
      span.setAttribute(key, value);
    }
  }
}

export function endSpanWithError(span: Span, error: Error | unknown): void {
  recordException(span, error);
  span.end();
}
