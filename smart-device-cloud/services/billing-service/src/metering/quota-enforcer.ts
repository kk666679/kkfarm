import type { ResourceType } from '@smart-device-cloud/shared';

export interface QuotaEnforcerConfig {
  hardLimits: Partial<Record<ResourceType, number>>;
}

export class QuotaEnforcer {
  constructor(private readonly config: QuotaEnforcerConfig) {}

  enforce(
    resourceType: ResourceType,
    current: number,
    requested: number
  ): { allowed: boolean; reason?: string } {
    const limit = this.config.hardLimits[resourceType];
    if (limit === undefined) return { allowed: true };
    if (current + requested > limit) {
      return {
        allowed: false,
        reason: `Quota exceeded for ${resourceType}: ${current + requested} > ${limit}`,
      };
    }
    return { allowed: true };
  }
}
