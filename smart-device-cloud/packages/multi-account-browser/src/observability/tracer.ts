export interface BrowserTrace {
  id: string;
  profileId: string;
  sessionId?: string;
  action: string;
  timestamp: string;
}

export class BrowserTracer {
  private readonly traces: BrowserTrace[] = [];

  record(profileId: string, action: string, sessionId?: string): BrowserTrace {
    const trace: BrowserTrace = {
      id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      profileId,
      ...(sessionId ? { sessionId } : {}),
      action,
      timestamp: new Date().toISOString(),
    };
    this.traces.push(trace);
    return { ...trace };
  }

  list(profileId?: string): BrowserTrace[] {
    return this.traces
      .filter(trace => !profileId || trace.profileId === profileId)
      .map(trace => ({ ...trace }));
  }
}
