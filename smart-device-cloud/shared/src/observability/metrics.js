import { metrics } from '@opentelemetry/api';
import { config } from '../config/env';
let _meter = null;
export function getMeter(serviceName) {
  if (_meter) return _meter;
  _meter = metrics.getMeter(serviceName || config.OTEL_SERVICE_NAME, '1.0.0');
  return _meter;
}
export function createCounter(name, description) {
  return getMeter().createCounter(name, { description });
}
export function createGauge(name, description) {
  return getMeter().createObservableGauge(name, { description });
}
export function createHistogram(name, description) {
  return getMeter().createHistogram(name, { description });
}
export function createServiceMetrics(prefix) {
  const meter = getMeter();
  return {
    requestCount: meter.createCounter(`${prefix}_requests_total`, {
      description: 'Total number of requests',
    }),
    errorCount: meter.createCounter(`${prefix}_errors_total`, {
      description: 'Total number of errors',
    }),
    duration: meter.createHistogram(`${prefix}_request_duration_ms`, {
      description: 'Request duration in milliseconds',
    }),
    activeRequests: meter.createObservableGauge(`${prefix}_active_requests`, {
      description: 'Number of active requests',
    }),
  };
}
export function recordRequest(metrics, durationMs, attrs = {}) {
  metrics.duration.record(durationMs, attrs);
  metrics.requestCount.add(1, attrs);
}
export function recordError(metrics, errorType, attrs = {}) {
  metrics.errorCount.add(1, { error_type: errorType, ...attrs });
}
//# sourceMappingURL=metrics.js.map
