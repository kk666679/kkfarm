import { type Tracer, type Span, type Attributes, type Context } from '@opentelemetry/api';
export declare function getTracer(serviceName?: string): Tracer;
export declare function startRootSpan(name: string, attributes?: Attributes): Span;
export declare function startSpanFromCtx(
  tracer: Tracer,
  name: string,
  ctx?: Context,
  attributes?: Attributes
): Span;
export declare function recordException(
  span: Span,
  error: Error | unknown,
  attributes?: Attributes
): void;
export declare function injectTraceContext(span: Span): Record<string, string>;
export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}
export declare function addSpanAttributes(span: Span, attrs: SpanAttributes): void;
export declare function endSpanWithError(span: Span, error: Error | unknown): void;
//# sourceMappingURL=tracer.d.ts.map
