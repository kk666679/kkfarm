import {
  getTracer,
  createServiceMetrics,
  injectTraceContext,
} from '@smart-device-cloud/shared/observability';
import type { Span } from '@opentelemetry/api';

let _tracer = getTracer('mcp-server');

export { _tracer as tracer, getTracer as getTracer, createServiceMetrics, injectTraceContext };
export type { Span };
