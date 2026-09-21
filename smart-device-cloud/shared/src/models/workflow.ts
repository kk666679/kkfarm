export type WorkflowStatus =
  | 'active'
  | 'paused'
  | 'disabled'
  | 'running'
  | 'completed'
  | 'failed'
  | 'draft'
  | 'cancelled'
  | 'archived';
export type WorkflowTriggerType = 'scheduled' | 'manual' | 'webhook' | 'event-based';
export type WorkflowStepType =
  | 'trigger'
  | 'provision_devices'
  | 'install_app'
  | 'launch_app'
  | 'execute_test'
  | 'collect_results'
  | 'generate_report'
  | 'release_devices';

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
  durationMs?: number;
  triggeredBy?: { id: string; name: string } | null;
  errorMessage?: string | null;
  cost?: number | null;
  tokensUsed?: number | null;
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
  nodes?: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
  runCount?: number;
  successRate?: number;
  lastRunAt?: string | null;
}

export type WorkloadCategory =
  | 'QA Testing'
  | 'qa_testing'
  | 'App Monitoring'
  | 'Automation'
  | 'Data Collection'
  | 'Regression Testing'
  | 'Maintenance'
  | 'Scheduled Jobs'
  | 'automation';
export type WorkloadStatus =
  'Running' | 'Completed' | 'Failed' | 'Paused' | 'running' | 'completed' | 'failed' | 'pending';

export interface Workload {
  id: string;
  name: string;
  description?: string;
  category: WorkloadCategory;
  status: WorkloadStatus;
  deviceCount: number;
  deviceIds: string[];
  progressPercent: number;
  successRate: number;
  failureCount: number;
  runtimeSeconds: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  lastUpdatedAt: string;
  progress?: number;
  updatedAt?: string;
}

export interface WorkloadExecution {
  id: string;
  workloadId: string;
  deviceId?: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: unknown;
  deviceResults?: DeviceExecutionResult[];
}

export interface DeviceExecutionResult {
  deviceId: string;
  status: 'success' | 'failure';
  output?: unknown;
  error?: string;
  durationMs: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
}
