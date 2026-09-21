import { randomUUID } from 'crypto';
import { all, run, get } from '../db/database.ts';
import type { Workflow, WorkflowStatus, WorkflowExecution } from '@smart-device-cloud/shared';

export class WorkflowService {
  async getAll(): Promise<Workflow[]> {
    const rows = await all<any>('SELECT * FROM workflows ORDER BY updated_at DESC');
    return rows.map(this.mapRow);
  }

  async getById(id: string): Promise<Workflow | null> {
    const row = await get<any>('SELECT * FROM workflows WHERE id = $1', [id]);
    return row ? this.mapRow(row) : null;
  }

  async create(data: Partial<Workflow>): Promise<Workflow> {
    const id = data.id ?? `workflow-${randomUUID()}`;
    const now = new Date().toISOString();
    const workflow: Workflow = {
      id,
      name: data.name ?? 'Unnamed Workflow',
      description: data.description ?? '',
      trigger: data.trigger ?? { type: 'manual' },
      triggerType: data.triggerType ?? 'manual',
      cronExpression: data.cronExpression,
      steps: data.steps ?? [],
      status: data.status ?? 'draft',
      createdAt: now,
      updatedAt: now,
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
      runCount: 0,
      successRate: 100,
      lastRunAt: null,
      executionHistory: [],
    };

    await run(
      `INSERT INTO workflows (id, name, description, trigger_type, cron_expression, steps, status, created_at, updated_at, nodes, edges)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        workflow.id,
        workflow.name,
        workflow.description,
        workflow.triggerType,
        workflow.cronExpression,
        JSON.stringify(workflow.steps),
        workflow.status,
        workflow.createdAt,
        workflow.updatedAt,
        JSON.stringify(workflow.nodes),
        JSON.stringify(workflow.edges),
      ]
    );

    return workflow;
  }

  async save(data: {
    id?: string;
    name: string;
    nodes?: unknown[];
    edges?: unknown[];
  }): Promise<{ workflowId: string }> {
    const { id, name, nodes, edges } = data;
    if (id) {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Workflow not found');
      const now = new Date().toISOString();
      await run(
        `UPDATE workflows SET name = $1, nodes = $2, edges = $3, updated_at = $3 WHERE id = $4`,
        [name, JSON.stringify(nodes ?? []), JSON.stringify(edges ?? []), now, id]
      );
      return { workflowId: id };
    } else {
      const workflow = await this.create({ name, nodes: nodes as any, edges: edges as any });
      return { workflowId: workflow.id };
    }
  }

  async duplicate(id: string): Promise<{ workflowId: string }> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Workflow not found');
    const newId = `workflow-${randomUUID()}`;
    const now = new Date().toISOString();
    const newName = `${existing.name} (copy)`;
    await run(
      `INSERT INTO workflows (id, name, description, trigger_type, cron_expression, steps, status, created_at, updated_at, nodes, edges)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        `workflow-${randomUUID()}`,
        newName,
        existing.description,
        existing.triggerType,
        existing.cronExpression,
        JSON.stringify(existing.steps),
        'draft',
        now,
        now,
        JSON.stringify(existing.nodes ?? []),
        JSON.stringify(existing.edges ?? []),
      ]
    );
    return { workflowId: newId };
  }

  async getExecutions(workflowId: string, limit = 50): Promise<WorkflowExecution[]> {
    try {
      const rows = await all<any>(
        `SELECT * FROM workflow_executions WHERE workflow_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [workflowId, limit]
      );
      return rows.map(row => ({
        id: row.id,
        workflowId: row.workflow_id,
        deviceId: row.device_id,
        status: row.status,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        error: row.error,
        durationMs: row.duration_ms,
        triggeredBy: row.triggered_by ? JSON.parse(row.triggered_by) : null,
        errorMessage: row.error_message,
        cost: row.cost,
        tokensUsed: row.tokens_used,
      }));
    } catch {
      return [];
    }
  }

  async updateStatus(id: string, status: WorkflowStatus): Promise<void> {
    const now = new Date().toISOString();
    await run(`UPDATE workflows SET status = $1, updated_at = $2 WHERE id = $3`, [status, now, id]);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const existing = await this.getById(id);
    if (!existing) return { success: false };
    await run('DELETE FROM workflows WHERE id = $1', [id]);
    return { success: true };
  }

  async updateCurrentStep(id: string, stepId: string | null): Promise<void> {
    const now = new Date().toISOString();
    await run(`UPDATE workflows SET current_step_id = $1, updated_at = $2 WHERE id = $3`, [
      stepId,
      now,
      id,
    ]);
  }

  private mapRow(row: any): Workflow {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      trigger: { type: row.trigger_type },
      triggerType: row.trigger_type,
      cronExpression: row.cron_expression,
      steps: JSON.parse(row.steps ?? '[]'),
      status: row.status as WorkflowStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      nodes: row.nodes ? JSON.parse(row.nodes) : [],
      edges: row.edges ? JSON.parse(row.edges) : [],
      runCount: row.run_count ?? 0,
      successRate: row.success_rate ?? 100,
      lastRunAt: row.last_run_at ?? null,
      executionHistory: [],
    };
  }
}

export const workflowService = new WorkflowService();
