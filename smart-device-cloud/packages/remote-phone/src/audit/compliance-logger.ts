import type { AuditEvent } from '../types';

export class ComplianceLogger {
  constructor(private readonly write: (event: AuditEvent) => Promise<void>) {}

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.write({ ...event, id: `compliance-${Date.now()}`, timestamp });
  }
}
