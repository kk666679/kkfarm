import {
  metrics,
  type Meter,
  type Counter,
  type ObservableGauge,
  type Histogram,
} from '@opentelemetry/api';
import { config } from '../config/env';

let _meter: Meter | null = null;

export function getMeter(serviceName?: string): Meter {
  if (_meter) return _meter;
  _meter = metrics.getMeter(serviceName || config.OTEL_SERVICE_NAME, '1.0.0');
  return _meter;
}

export function createCounter(name: string, description?: string): Counter {
  return getMeter().createCounter(name, { description });
}

export function createGauge(name: string, description?: string): ObservableGauge {
  return getMeter().createObservableGauge(name, { description });
}

export function createHistogram(name: string, description?: string): Histogram {
  return getMeter().createHistogram(name, { description });
}

export interface ServiceMetrics {
  requestCount: Counter;
  errorCount: Counter;
  duration: Histogram;
  activeRequests: ObservableGauge;
}

export function createServiceMetrics(prefix: string): ServiceMetrics {
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

export function recordRequest(
  metrics: ServiceMetrics,
  durationMs: number,
  attrs: Record<string, string | number> = {}
): void {
  metrics.duration.record(durationMs, attrs);
  metrics.requestCount.add(1, attrs);
}

export function recordError(
  metrics: ServiceMetrics,
  errorType: string,
  attrs: Record<string, string | number> = {}
): void {
  metrics.errorCount.add(1, { error_type: errorType, ...attrs });
}
