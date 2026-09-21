import { trace } from '@opentelemetry/api';

export function getTracer() {
  return trace.getTracer('sdc-api-gateway');
}
