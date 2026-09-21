export interface DeviceAiTrace {
  id: string;
  operation: string;
  durationMs: number;
  timestamp: string;
}

export class DeviceAiTracer {
  private readonly traces: DeviceAiTrace[] = [];

  record(operation: string, durationMs: number): DeviceAiTrace {
    const trace: DeviceAiTrace = {
      id: `ai-trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
    };
    this.traces.push(trace);
    return { ...trace };
  }

  list(): DeviceAiTrace[] {
    return this.traces.map(trace => ({ ...trace }));
  }
}
