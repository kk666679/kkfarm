export type TaskType =
  | 'shell'
  | 'tap'
  | 'swipe'
  | 'screenshot'
  | 'install_apk'
  | 'uninstall_apk'
  | 'launch_app'
  | 'clear_app_data'
  | 'wait'
  | 'sequence';
export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  deviceId?: string;
  priority: number;
  payload: Record<string, unknown>;
  progress: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  retryCount?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface TaskHandler {
  (task: Task, deviceManager: unknown): Promise<TaskHandlerResult>;
}

export interface TaskHandlerResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
}
