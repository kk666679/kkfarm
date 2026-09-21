import type { ResourceType } from './pricing';

export interface UsageRecord {
  tenantId: string;
  resourceType: ResourceType;
  quantity: number;
  timestamp: string;
  metadata?: Record<string, string>;
  id?: string;
}

export interface UsageSummary {
  tenantId: string;
  period: { from: string; to: string };
  usage: Record<ResourceType, number>;
  recordCount: number;
}

function zeroUsage(): Record<ResourceType, number> {
  return {
    device_hour: 0,
    emulator_hour: 0,
    remote_session_min: 0,
    browser_profile: 0,
    api_call: 0,
    storage_gb: 0,
    workflow_run: 0,
    ai_token: 0,
    mcp_call: 0,
  };
}

export class UsageMeter {
  private readonly records: UsageRecord[] = [];
  private readonly seenIds = new Set<string>();

  record(entry: UsageRecord): UsageRecord {
    const timestamp = new Date(entry.timestamp);
    if (Number.isNaN(timestamp.getTime())) throw new Error('Usage timestamp is invalid');
    if (!Number.isFinite(entry.quantity) || entry.quantity < 0)
      throw new Error('Usage quantity must be non-negative');
    const record: UsageRecord = { ...entry, timestamp: timestamp.toISOString() };
    if (record.id) {
      if (this.seenIds.has(record.id)) return this.get(record.id) ?? record;
      this.seenIds.add(record.id);
    }
    this.records.push(record);
    return record;
  }

  get(id: string): UsageRecord | undefined {
    return this.records.find(record => record.id === id);
  }

  summarize(tenantId: string, from: string, to: string): UsageSummary {
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || start > end)
      throw new Error('Usage period is invalid');
    const usage = zeroUsage();
    let recordCount = 0;
    for (const record of this.records) {
      const timestamp = new Date(record.timestamp).getTime();
      if (record.tenantId === tenantId && timestamp >= start && timestamp <= end) {
        usage[record.resourceType] += record.quantity;
        recordCount += 1;
      }
    }
    return { tenantId, period: { from, to }, usage, recordCount };
  }

  aggregateByResource(
    tenantId: string,
    from: string,
    to: string
  ): Partial<Record<ResourceType, number>> {
    return Object.fromEntries(
      Object.entries(this.summarize(tenantId, from, to).usage).filter(([, value]) => value > 0)
    ) as Partial<Record<ResourceType, number>>;
  }

  flush(tenantId: string): number {
    const before = this.records.length;
    for (let index = this.records.length - 1; index >= 0; index -= 1) {
      const record = this.records[index];
      if (record?.tenantId === tenantId) {
        if (record.id) this.seenIds.delete(record.id);
        this.records.splice(index, 1);
      }
    }
    return before - this.records.length;
  }

  snapshot(): UsageRecord[] {
    return this.records.map(record => ({
      ...record,
      metadata: record.metadata ? { ...record.metadata } : record.metadata,
    }));
  }
}
