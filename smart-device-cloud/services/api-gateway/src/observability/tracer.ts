import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from '@opentelemetry/semantic-conventions';

export function startTelemetry(config: { otelEndpoint: string; otelServiceName: string }) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.otelServiceName,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '1.0.0',
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV ?? 'development',
      'service.namespace': 'sdc',
      'service.criticality': 'critical',
    }),
    traceExporter: new OTLPTraceExporter({ url: config.otelEndpoint }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ url: config.otelEndpoint }),
      exportIntervalMillis: 15000,
    }),
  });
  sdk.start();
  return sdk;
}
