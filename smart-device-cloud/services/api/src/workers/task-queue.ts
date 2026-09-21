import { randomUUID } from 'crypto';
import { run, all, get } from '../db/database.ts';
import type { DeviceProvider } from '@smart-device-cloud/device-protocol';
import type { DeviceManager } from '../server/device-manager.ts';
import type { Task, TaskHandler } from '@smart-device-cloud/shared';
import { createTaskHandlers } from './task-handlers.ts';

export type { TaskHandler };

export interface TaskQueueDependencies {
  deviceManager: DeviceManager;
  provider: DeviceProvider;
  concurrency?: number;
  logger?: {
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
  };
}

type QueuedTask = {
  id: string;
  priority: number;
  enqueuedAt: number;
};

export class TaskQueue {
  private queue: QueuedTask[] = [];
  private active = new Map<
    string,
    {
      task: Task;
      resolve: (value: void | PromiseLike<void>) => void;
      reject: (reason: unknown) => void;
    }
  >();
  private running = 0;
  private stopped = false;
  private handlers: Map<string, TaskHandler>;

  constructor(private deps: TaskQueueDependencies) {
    this.handlers = createTaskHandlers(this.deps.deviceManager);
  }

  enqueue(task: Task): void {
    const existing = this.queue.find(t => t.id === task.id);
    if (existing) {
      return;
    }
    this.queue.push({
      id: task.id,
      priority: task.priority,
      enqueuedAt: Date.now(),
    });
    this.queue.sort((a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt);
    this.deps.logger?.info(`Task enqueued`, { taskId: task.id, queueLength: this.queue.length });
    try {
      (globalThis as any).wsService?.broadcast?.({ type: 'task.created', task });
    } catch {}
  }

  async processNext(): Promise<void> {
    if (this.stopped) {
      return;
    }
    const concurrency = this.deps.concurrency ?? 5;
    if (this.running >= concurrency) {
      return;
    }

    const next = this.queue.shift();
    if (!next) {
      return;
    }

    this.running++;
    const task = this.getTaskFromDb(next.id);
    if (!task) {
      this.running--;
      return;
    }

    this.updateTaskStatus(task.id, 'running');
    this.deps.logger?.info(`Task processing started`, { taskId: task.id });

    return new Promise((resolve, reject) => {
      const entry = {
        task,
        resolve,
        reject,
      };
      this.active.set(task.id, entry);
      this.runTask(task).then(
        result => {
          this.active.delete(task.id);
          this.running--;
          resolve();
          void this.processNext();
        },
        err => {
          this.active.delete(task.id);
          this.running--;
          reject(err);
          void this.processNext();
        }
      );
    });
  }

  cancel(taskId: string): boolean {
    const inQueue = this.queue.some(t => t.id === taskId);
    this.queue = this.queue.filter(t => t.id !== taskId);
    const active = this.active.get(taskId);
    if (active) {
      this.updateTaskStatus(taskId, 'cancelled');
      this.deps.logger?.info(`Task cancelled`, { taskId });
      this.active.delete(taskId);
      this.running = Math.max(0, this.running - 1);
      void this.processNext();
      return true;
    }
    if (inQueue) {
      this.updateTaskStatus(taskId, 'cancelled');
      return true;
    }
    return false;
  }

  stop(): void {
    this.stopped = true;
    this.queue = [];
    for (const [, entry] of this.active) {
      this.updateTaskStatus(entry.task.id, 'cancelled');
    }
    this.active.clear();
    this.running = 0;
  }

  private getTaskFromDb(id: string): Task | undefined {
    const row = get<Record<string, unknown>>('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!row) {
      return undefined;
    }
    return {
      id: row.id as string,
      type: row.type as Task['type'],
      status: row.status as Task['status'],
      deviceId: row.device_id as string | undefined,
      priority: row.priority as number,
      payload: JSON.parse((row.payload as string) || '{}'),
      progress: row.progress as number,
      error: row.error as string | undefined,
      startedAt: row.started_at as string | undefined,
      completedAt: row.completed_at as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private updateTaskStatus(id: string, status: Task['status'], error?: string): void {
    const now = new Date().toISOString();
    if (status === 'running') {
      run("UPDATE tasks SET status = 'running', started_at = ?, updated_at = ? WHERE id = ?", [
        now,
        now,
        id,
      ]);
    } else if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      run('UPDATE tasks SET status = ?, completed_at = ?, updated_at = ?, error = ? WHERE id = ?', [
        status,
        now,
        now,
        error ?? null,
        id,
      ]);
    } else {
      run('UPDATE tasks SET status = ?, updated_at = ?, error = COALESCE(?, error) WHERE id = ?', [
        status,
        now,
        error ?? null,
        id,
      ]);
    }
    run('INSERT INTO task_events (task_id, event, data) VALUES (?, ?, ?)', [
      id,
      status,
      JSON.stringify({ timestamp: now, error }),
    ]);

    const task = this.getTaskFromDb(id);
    if (!task) {
      return;
    }
    try {
      const ws = (globalThis as any).wsService;
      if (!ws) {
        return;
      }
      if (status === 'completed') {
        ws.broadcast({ type: 'task.completed', taskId: id });
      } else if (status === 'failed') {
        ws.broadcast({ type: 'task.failed', taskId: id, error });
      } else {
        ws.broadcast({ type: 'task.updated', task });
      }
    } catch {}
  }

  private async runTask(task: Task): Promise<unknown> {
    const handler = this.handlers.get(task.type);
    if (!handler) {
      const error = `Unknown task type: ${task.type}`;
      this.deps.logger?.error(`Task failed`, { taskId: task.id, error });
      this.updateTaskStatus(task.id, 'failed', error);
      throw new Error(error);
    }

    try {
      let deviceId = task.deviceId;
      if (!deviceId) {
        const available = this.deps.deviceManager
          .getAll()
          .find((d: any) => d.status === 'online' && !d.assignedTaskId);
        if (!available) {
          const error = 'No devices available';
          this.updateTaskStatus(task.id, 'failed', error);
          throw new Error(error);
        }
        deviceId = available.id;
        run('UPDATE tasks SET device_id = ? WHERE id = ?', [deviceId, task.id]);
      }

      const device = await this.deps.deviceManager.acquire(deviceId, task.id);
      this.deps.logger?.info(`Device acquired`, { taskId: task.id, deviceId });

      try {
        const result = await handler(task, this.deps.deviceManager);
        this.updateTaskStatus(task.id, 'completed');
        await this.deps.deviceManager.release(deviceId, task.id);
        this.deps.logger?.info(`Task completed`, { taskId: task.id, deviceId });
        return result;
      } catch (err) {
        await this.deps.deviceManager.release(deviceId, task.id);
        throw err;
      }
    } catch (err) {
      const message = (err as Error).message;
      this.updateTaskStatus(task.id, 'failed', message);
      this.deps.logger?.error(`Task failed`, { taskId: task.id, error: message });
      throw err;
    }
  }
}
