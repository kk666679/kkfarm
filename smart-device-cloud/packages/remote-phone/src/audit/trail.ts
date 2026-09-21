import type { AuditEvent } from '../types';

export class RemoteAuditTrail {
  private readonly events: AuditEvent[] = [];

  append(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const entry: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.push(entry);
    return { ...entry, ...(entry.metadata ? { metadata: { ...entry.metadata } } : {}) };
  }

  forSession(sessionId: string): AuditEvent[] {
    return this.events
      .filter(event => event.sessionId === sessionId)
      .map(event => ({ ...event, ...(event.metadata ? { metadata: { ...event.metadata } } : {}) }));
  }
}
