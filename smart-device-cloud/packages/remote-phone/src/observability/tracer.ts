export interface RemoteTrace {
  id: string;
  sessionId: string;
  operation: string;
  timestamp: string;
}

export class RemoteTracer {
  private readonly traces: RemoteTrace[] = [];

  record(sessionId: string, operation: string): RemoteTrace {
    const trace: RemoteTrace = {
      id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId,
      operation,
      timestamp: new Date().toISOString(),
    };
    this.traces.push(trace);
    return { ...trace };
  }

  list(sessionId?: string): RemoteTrace[] {
    return this.traces
      .filter(trace => !sessionId || trace.sessionId === sessionId)
      .map(trace => ({ ...trace }));
  }
}
