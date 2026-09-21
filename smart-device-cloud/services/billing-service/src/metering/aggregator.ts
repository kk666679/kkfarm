import type { ResourceType } from '@smart-device-cloud/shared';
import type { UsageRecord } from '@smart-device-cloud/shared';

export interface AggregatedUsage {
  tenantId: string;
  period: { from: string; to: string };
  totals: Record<ResourceType, number>;
}

export function aggregateUsage(
  records: UsageRecord[],
  tenantId: string,
  from: string,
  to: string
): AggregatedUsage {
  const totals = {} as Record<ResourceType, number>;
  for (const r of records) {
    if (r.tenantId !== tenantId || r.timestamp < from || r.timestamp > to) continue;
    totals[r.resourceType] = (totals[r.resourceType] ?? 0) + r.quantity;
  }
  return { tenantId, period: { from, to }, totals };
}
