export type McpTaskType =
  'workflow' | 'device_operation' | 'integration' | 'analysis' | 'automation';

export interface McpTask {
  id: string;
  name: string;
  type: McpTaskType;
  params: Record<string, unknown>;
  scheduledAt?: string;
  recurring?: string;
  maxRetries: number;
  timeoutMs?: number;
  allowedTools: string[];
  createdAt: string;
  updatedAt: string;
}

export interface McpTaskRegistry {
  register(task: McpTask): void;
  get(id: string): McpTask | undefined;
  list(): McpTask[];
  remove(id: string): boolean;
  getDueTasks(now?: string): McpTask[];
  markCompleted(id: string, result: unknown): void;
}

export class InMemoryMcpTaskRegistry implements McpTaskRegistry {
  private readonly tasks = new Map<string, McpTask>();

  register(task: McpTask): void {
    this.tasks.set(task.id, task);
  }

  get(id: string): McpTask | undefined {
    return this.tasks.get(id);
  }

  list(): McpTask[] {
    return Array.from(this.tasks.values());
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  getDueTasks(now: string = new Date().toISOString()): McpTask[] {
    return Array.from(this.tasks.values()).filter(t => !t.scheduledAt || t.scheduledAt <= now);
  }

  markCompleted(_id: string, _result: unknown): void {
    // no-op
  }
}
