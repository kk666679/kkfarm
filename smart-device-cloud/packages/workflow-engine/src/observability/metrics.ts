export interface WorkflowMetricValues {
  executions: number;
  completed: number;
  failed: number;
  averageDurationMs: number;
}

export class WorkflowMetrics {
  private values: WorkflowMetricValues = {
    executions: 0,
    completed: 0,
    failed: 0,
    averageDurationMs: 0,
  };
  private totalDuration = 0;

  record(durationMs: number, status: 'completed' | 'failed'): void {
    this.values.executions += 1;
    if (status === 'completed') this.values.completed += 1;
    else this.values.failed += 1;
    this.totalDuration += durationMs;
    this.values.averageDurationMs = this.totalDuration / this.values.executions;
  }

  snapshot(): WorkflowMetricValues {
    return { ...this.values };
  }
}

export const workflowMetrics = new WorkflowMetrics();
