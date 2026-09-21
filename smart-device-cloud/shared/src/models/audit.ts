export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'execute'
  | 'authorize'
  | 'revoke'
  | 'login'
  | 'logout'
  | 'workflow_create'
  | 'workflow_execute';
export type AuditTargetType =
  'device' | 'workload' | 'application' | 'configuration' | 'integration' | 'workflow' | 'user';
export type AuditStatus = 'success' | 'failure';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  operatorId: string;
  operatorEmail: string;
  operatorRole: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetName: string;
  parameters: Record<string, unknown>;
  status: AuditStatus;
  errorMessage?: string;
  traceId?: string;
  immutable: boolean;
  actor?: string;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  details?: Record<string, unknown>;
}

export interface CostRecord {
  id: string;
  resourceId: string;
  resourceType: string;
  amount: number;
  currency: string;
  period: string;
  category: CostCategory;
  timestamp: string;
  region: string;
  unit: string;
  quantity: number;
  rate: number;
  recordedAt?: string;
}

export type CostCategory = 'compute' | 'storage' | 'network' | 'license' | 'data' | 'automation';

export interface CostSummary {
  total: number;
  byCategory: Record<CostCategory, number>;
  byRegion: Record<string, number>;
  period: string;
  ceiling?: number;
  exceeded: boolean;
  costPerDevice: number;
  previousPeriodCost: number;
  changePercent: number;
}
