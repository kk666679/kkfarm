import type { ResourceType } from '@smart-device-cloud/shared';
import type { UsageRecord } from '@smart-device-cloud/shared';

export interface QuotaConfig {
  tenantId: string;
  limits: Partial<Record<ResourceType, number>>;
}

export class UsageCollector {
  private readonly records: UsageRecord[] = [];
  private readonly quotas = new Map<string, QuotaConfig>();

  record(entry: UsageRecord): void {
    this.records.push(entry);
  }

  setQuota(config: QuotaConfig): void {
    this.quotas.set(config.tenantId, config);
  }

  getUsage(tenantId: string, resourceType: ResourceType, from: string, to: string): number {
    return this.records
      .filter(
        r =>
          r.tenantId === tenantId &&
          r.resourceType === resourceType &&
          r.timestamp >= from &&
          r.timestamp <= to
      )
      .reduce((sum, r) => sum + r.quantity, 0);
  }

  isWithinQuota(
    tenantId: string,
    resourceType: ResourceType,
    additional: number,
    from: string,
    to: string
  ): boolean {
    const quota = this.quotas.get(tenantId);
    if (!quota) return true;
    const limit = quota.limits[resourceType];
    if (limit === undefined) return true;
    const current = this.getUsage(tenantId, resourceType, from, to);
    return current + additional <= limit;
  }
}
