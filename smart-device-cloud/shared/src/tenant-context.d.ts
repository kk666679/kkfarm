import type { CloudRegion } from './cloud-regions';
export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type TenantIsolationMode = 'strict' | 'shared';
export interface TenantQuotas {
  devices?: number;
  sessions?: number;
  workflows?: number;
  apiCallsPerMinute?: number;
  storageGb?: number;
  costCeiling?: number;
}
export interface TenantContext {
  tenantId: string;
  tenantName?: string;
  plan: TenantPlan;
  region: CloudRegion | string;
  features: string[];
  isolationMode: TenantIsolationMode;
  quotas: TenantQuotas;
  killSwitch: boolean;
  updatedAt: string;
}
export interface TenantAccess {
  tenantId: string;
  feature?: string;
  region?: CloudRegion | string;
  cost?: number;
}
export declare function setTenantContext(ctx: TenantContext): void;
export declare function getTenantContext(tenantId: string): TenantContext | undefined;
export declare function requireTenantContext(tenantId: string): TenantContext;
export declare function getCurrentTenantContext(): TenantContext | undefined;
export declare function runWithTenantContext<T>(context: TenantContext, work: () => T): T;
export declare function clearTenantContext(tenantId: string): boolean;
export declare function hasFeature(context: TenantContext, feature: string): boolean;
export declare function assertTenantAccess(access: TenantAccess): TenantContext;
export declare function withQuota<T>(
  context: TenantContext,
  key: keyof TenantQuotas,
  required: number,
  work: () => T
): T;
//# sourceMappingURL=tenant-context.d.ts.map
