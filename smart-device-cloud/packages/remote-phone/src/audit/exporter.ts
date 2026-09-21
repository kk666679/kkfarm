import type { AuditEvent } from '../types';

export class AuditExporter {
  export(events: readonly AuditEvent[], format: 'json' | 'csv' = 'json'): string {
    if (format === 'json')
      return JSON.stringify(
        events.map(event => ({ ...event })),
        null,
        2
      );
    const headers = ['id', 'sessionId', 'userId', 'action', 'timestamp', 'outcome'];
    const rows = events.map(event =>
      [event.id, event.sessionId, event.userId, event.action, event.timestamp, event.outcome]
        .map(value => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
}
