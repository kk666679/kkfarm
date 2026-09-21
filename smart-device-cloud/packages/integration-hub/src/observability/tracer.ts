export interface IntegrationTrace {
  id: string;
  integrationId: string;
  operation: string;
  timestamp: string;
}

export class IntegrationTracer {
  private readonly traces: IntegrationTrace[] = [];

  record(integrationId: string, operation: string): IntegrationTrace {
    const trace: IntegrationTrace = {
      id: `integration-trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      integrationId,
      operation,
      timestamp: new Date().toISOString(),
    };
    this.traces.push(trace);
    return { ...trace };
  }

  list(integrationId?: string): IntegrationTrace[] {
    return this.traces
      .filter(trace => !integrationId || trace.integrationId === integrationId)
      .map(trace => ({ ...trace }));
  }
}
