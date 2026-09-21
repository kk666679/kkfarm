import { run, all } from '../db/database.ts';
import type { AuditLogEntry, AuditAction, AuditStatus } from '@smart-device-cloud/shared';

export class AuditService {
  async record(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const operatorId = entry.operatorId ?? entry.actor ?? 'system';
    const operatorRole = entry.operatorRole ?? 'viewer';
    const targetType = entry.targetType ?? entry.resourceType ?? 'unknown';
    const targetId = entry.targetId ?? entry.resourceId ?? null;
    const description = entry.description ?? 'Audit event';
    const parameters = entry.parameters ?? entry.details ?? {};

    await run(
      `INSERT INTO audit_log (id, operator_id, operator_role, action, target_type, target_id, description, parameters, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        operatorId,
        operatorRole,
        entry.action,
        targetType,
        targetId,
        description,
        JSON.stringify(parameters),
        new Date().toISOString(),
      ]
    );
  }

  async getAll(filters?: {
    operatorId?: string;
    action?: AuditAction;
    targetId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: AuditLogEntry[]; total: number }> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (filters?.operatorId) {
      where.push('operator_id = $' + (params.length + 1));
      params.push(filters.operatorId);
    }
    if (filters?.action) {
      where.push('action = $' + (params.length + 1));
      params.push(filters.action);
    }
    if (filters?.targetId) {
      where.push('target_id = $' + (params.length + 1));
      params.push(filters.targetId);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const limit = filters?.limit ?? 100;
    const offset = filters?.offset ?? 0;

    const entries = await all<any>(
      `SELECT * FROM audit_log ${whereClause} ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const totalRow = await all<{ count: number }>(
      `SELECT COUNT(*) as count FROM audit_log ${whereClause}`,
      params
    );

    return {
      entries: entries.map(this.mapRow),
      total: totalRow[0]?.count ?? 0,
    };
  }

  private mapRow(row: any): AuditLogEntry {
    return {
      id: row.id,
      timestamp: row.timestamp,
      actor: row.operator_id,
      action: row.action as AuditAction,
      resourceType: row.target_type,
      resourceId: row.target_id,
      details: JSON.parse(row.parameters ?? '{}'),
      operatorId: row.operator_id,
      operatorRole: row.operator_role,
      operatorEmail: row.operator_email ?? '',
      targetType: row.target_type,
      targetId: row.target_id,
      targetName: row.target_name ?? '',
      description: row.description,
      parameters: JSON.parse(row.parameters ?? '{}'),
      status: row.status as AuditStatus,
      immutable: row.immutable ?? false,
    };
  }
}

export const auditService = new AuditService();
