import { randomUUID } from 'crypto';
import { all, run, get } from '../db/database.ts';
import type { Alert, AlertSeverity, AlertStatus } from '@smart-device-cloud/shared';

export class AlertService {
  async getAll(limit = 50): Promise<Alert[]> {
    const rows = await all<any>(`SELECT * FROM alerts ORDER BY created_at DESC LIMIT $1`, [limit]);
    return rows.map(this.mapRow);
  }

  async getById(id: string): Promise<Alert | null> {
    const row = await get<any>('SELECT * FROM alerts WHERE id = $1', [id]);
    return row ? this.mapRow(row) : null;
  }

  async create(data: Partial<Alert>): Promise<Alert> {
    const id = data.id ?? `alert-${randomUUID()}`;
    const now = new Date().toISOString();
    const alert: Alert = {
      id,
      timestamp: Date.now(),
      severity: data.severity ?? 'info',
      deviceId: data.deviceId ?? '',
      deviceName: data.deviceName ?? '',
      title: data.title ?? '',
      description: data.description ?? '',
      recommendedAction: data.recommendedAction ?? '',
      status: data.status ?? 'active',
      resolved: data.status === 'resolved',
      resolvedAt: data.status === 'resolved' ? now : undefined,
      resolvedBy: data.resolvedBy,
      createdAt: Date.now(),
      metadata: data.metadata ?? {},
    };

    await run(
      `INSERT INTO alerts (id, severity, status, device_id, device_name, title, description, recommended_action, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        alert.id,
        alert.severity,
        alert.status,
        alert.deviceId,
        alert.deviceName,
        alert.title,
        alert.description,
        alert.recommendedAction,
        JSON.stringify(alert.metadata),
        alert.createdAt,
      ]
    );

    return alert;
  }

  async resolve(id: string, resolvedBy?: string): Promise<Alert> {
    const now = new Date().toISOString();
    await run(
      `UPDATE alerts SET status = 'resolved', resolved_at = $1, resolved_by = $2 WHERE id = $3`,
      [now, resolvedBy, id]
    );
    return (await this.getById(id))!;
  }

  private mapRow(row: any): Alert {
    return {
      id: row.id,
      timestamp: new Date(row.created_at).getTime(),
      severity: row.severity as AlertSeverity,
      deviceId: row.device_id,
      deviceName: row.device_name,
      title: row.title ?? '',
      description: row.description,
      recommendedAction: row.recommended_action,
      status: row.status as AlertStatus,
      resolved: row.status === 'resolved',
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by,
      createdAt: new Date(row.created_at).getTime(),
      metadata: JSON.parse(row.metadata ?? '{}'),
    };
  }
}

export const alertService = new AlertService();
