import { randomUUID } from 'crypto';
import { all, run, get } from '../db/database.ts';
import type {
  Workload,
  WorkloadCategory,
  WorkloadStatus,
  WorkloadExecution,
} from '@smart-device-cloud/shared';

export class WorkloadService {
  async getAll(): Promise<Workload[]> {
    const rows = await all<any>('SELECT * FROM workloads ORDER BY updated_at DESC');
    return rows.map(this.mapRow);
  }

  async getById(id: string): Promise<Workload | null> {
    const row = await get<any>('SELECT * FROM workloads WHERE id = $1', [id]);
    return row ? this.mapRow(row) : null;
  }

  async create(data: Partial<Workload>): Promise<Workload> {
    const id = data.id ?? `workload-${randomUUID()}`;
    const now = new Date().toISOString();
    const workload: Workload = {
      id,
      name: data.name ?? 'Unnamed Workload',
      description: data.description ?? '',
      category: data.category ?? 'automation',
      status: data.status ?? 'pending',
      deviceCount: data.deviceIds?.length ?? 0,
      deviceIds: data.deviceIds ?? [],
      progressPercent: 0,
      successRate: 0,
      failureCount: 0,
      runtimeSeconds: 0,
      createdAt: now,
      lastUpdatedAt: now,
    };

    await run(
      `INSERT INTO workloads (id, name, description, category, status, device_ids, progress, success_rate, failure_count, runtime_seconds, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        workload.id,
        workload.name,
        workload.description,
        workload.category,
        workload.status,
        JSON.stringify(workload.deviceIds),
        workload.progressPercent,
        workload.successRate,
        workload.failureCount,
        workload.runtimeSeconds,
        workload.createdAt,
        workload.updatedAt,
      ]
    );

    return workload;
  }

  async updateStatus(id: string, status: WorkloadStatus): Promise<void> {
    const now = new Date().toISOString();
    await run(`UPDATE workloads SET status = $1, updated_at = $2 WHERE id = $3`, [status, now, id]);
  }

  async start(id: string, deviceIds: string[]): Promise<WorkloadExecution> {
    const workload = await this.getById(id);
    if (!workload) throw new Error('Workload not found');

    const executionId = `exec-${randomUUID()}`;
    const now = new Date().toISOString();
    const execution: WorkloadExecution = {
      id: executionId,
      workloadId: id,
      deviceId: deviceIds[0] ?? '',
      status: 'running',
      startedAt: now,
      result: null,
    };

    await run(
      `INSERT INTO workload_executions (id, workload_id, device_id, status, started_at) VALUES ($1, $2, $3, $4, $5)`,
      [
        execution.id,
        execution.workloadId,
        execution.deviceId,
        execution.status,
        execution.startedAt,
      ]
    );

    await run(
      `UPDATE workloads SET status = 'running', started_at = $1, device_ids = $2, updated_at = $3 WHERE id = $4`,
      [now, JSON.stringify(deviceIds), now, id]
    );

    return execution;
  }

  async getExecutions(workloadId: string, limit = 100): Promise<WorkloadExecution[]> {
    const rows = await all<any>(
      `SELECT * FROM workload_executions WHERE workload_id = $1 ORDER BY started_at DESC LIMIT $2`,
      [workloadId, limit]
    );
    return rows.map(this.mapExecutionRow);
  }

  private mapRow(row: any): Workload {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category as WorkloadCategory,
      status: row.status as WorkloadStatus,
      deviceCount: row.device_count,
      deviceIds: JSON.parse(row.device_ids ?? '[]'),
      progressPercent: row.progress,
      successRate: row.success_rate,
      failureCount: row.failure_count,
      runtimeSeconds: row.runtime_seconds,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      lastUpdatedAt: row.last_execution
        ? new Date(row.last_execution).toISOString()
        : row.updated_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapExecutionRow(row: any): WorkloadExecution {
    return {
      id: row.id,
      workloadId: row.workload_id,
      deviceId: row.device_id,
      status: row.status as 'running' | 'completed' | 'failed',
      startedAt: row.started_at,
      completedAt: row.completed_at,
      result: row.result ? JSON.parse(row.result) : null,
    };
  }
}

export const workloadService = new WorkloadService();
