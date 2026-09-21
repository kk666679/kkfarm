export type WorkflowStatus =
  'active' | 'paused' | 'disabled' | 'running' | 'completed' | 'failed' | 'draft' | 'cancelled';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowCreateParams {
  name: string;
  description?: string;
  steps: unknown[];
  trigger: unknown;
}
