export type WorkflowStatus =
  'active' | 'paused' | 'disabled' | 'running' | 'completed' | 'failed' | 'draft' | 'cancelled';
export type WorkflowTriggerType = 'scheduled' | 'manual' | 'webhook' | 'event-based';
export type WorkflowStepType =
  | 'trigger'
  | 'provision_devices'
  | 'install_app'
  | 'launch_app'
  | 'execute_test'
  | 'collect_results'
  | 'generate_report'
  | 'release_devices'
  | 'integration'
  | 'ai_analysis'
  | 'browser_automation'
  | 'emulator_operation'
  | 'remote_operation'
  | 'human_approval'
  | 'gate';

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  config: Record<string, unknown>;
  dependencies?: string[];
  nextSteps?: string[];
  timeoutMs?: number;
  retryCount?: number;
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  cronExpression?: string;
  webhookUrl?: string;
  eventSource?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  deviceId?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  error?: string;
  stepResults?: Record<string, WorkflowStepResult>;
}

export interface WorkflowStepResult {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  output?: unknown;
}

export interface StepResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  trigger: WorkflowTrigger;
  triggerType?: WorkflowTriggerType;
  cronExpression?: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  executionHistory?: WorkflowExecution[];
}

export interface WorkflowContext {
  workflow: Workflow;
  execution: WorkflowExecution;
  variables: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface WorkflowCreateInput {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  trigger: WorkflowTrigger;
  triggerType?: WorkflowTriggerType;
  cronExpression?: string;
  status?: WorkflowStatus;
}
