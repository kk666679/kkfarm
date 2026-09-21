import { type Meter, type Counter, type ObservableGauge, type Histogram } from '@opentelemetry/api';
export declare function getMeter(serviceName?: string): Meter;
export declare function createCounter(name: string, description?: string): Counter;
export declare function createGauge(name: string, description?: string): ObservableGauge;
export declare function createHistogram(name: string, description?: string): Histogram;
export interface ServiceMetrics {
  requestCount: Counter;
  errorCount: Counter;
  duration: Histogram;
  activeRequests: ObservableGauge;
}
export declare function createServiceMetrics(prefix: string): ServiceMetrics;
export declare function recordRequest(
  metrics: ServiceMetrics,
  durationMs: number,
  attrs?: Record<string, string | number>
): void;
export declare function recordError(
  metrics: ServiceMetrics,
  errorType: string,
  attrs?: Record<string, string | number>
): void;
//# sourceMappingURL=metrics.d.ts.map
