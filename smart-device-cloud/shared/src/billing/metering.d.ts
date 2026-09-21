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
  period: {
    from: string;
    to: string;
  };
  usage: Record<ResourceType, number>;
  recordCount: number;
}
export declare class UsageMeter {
  private readonly records;
  private readonly seenIds;
  record(entry: UsageRecord): UsageRecord;
  get(id: string): UsageRecord | undefined;
  summarize(tenantId: string, from: string, to: string): UsageSummary;
  aggregateByResource(
    tenantId: string,
    from: string,
    to: string
  ): Partial<Record<ResourceType, number>>;
  flush(tenantId: string): number;
  snapshot(): UsageRecord[];
}
//# sourceMappingURL=metering.d.ts.map
