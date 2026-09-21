export interface TelemetrySample {
  deviceId: string;
  timestamp: number;
  metrics: {
    cpuPercent: number;
    memoryPercent: number;
    storagePercent: number;
    batteryPercent: number;
    temperatureCelsius: number;
    networkLatencyMs: number;
    networkPacketLossPercent: number;
  };
  receivedAt: number;
}
export interface TelemetryBuffer {
  samples: TelemetrySample[];
  maxSize: number;
}
export interface TraceContext {
  traceId: string;
  spanId?: string;
  parentSpanId?: string;
  sampled?: boolean;
}
export interface Operation {
  id: string;
  type: string;
  deviceId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  traceId?: string;
}
//# sourceMappingURL=telemetry.d.ts.map
