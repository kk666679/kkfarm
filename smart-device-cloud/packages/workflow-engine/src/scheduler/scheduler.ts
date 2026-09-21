import type { Workflow } from '../types';

export interface ScheduledWorkflow {
  workflow: Workflow;
  nextRunAt: string;
}

export class WorkflowScheduler {
  private readonly scheduled = new Map<string, ScheduledWorkflow>();

  schedule(workflow: Workflow, nextRunAt: string): void {
    this.scheduled.set(workflow.id, {
      workflow: {
        ...workflow,
        steps: workflow.steps.map(step => ({ ...step, config: { ...step.config } })),
      },
      nextRunAt,
    });
  }

  due(now = new Date().toISOString()): ScheduledWorkflow[] {
    return Array.from(this.scheduled.values())
      .filter(item => item.nextRunAt <= now)
      .map(item => ({
        ...item,
        workflow: {
          ...item.workflow,
          steps: item.workflow.steps.map(step => ({ ...step, config: { ...step.config } })),
        },
      }));
  }

  cancel(workflowId: string): boolean {
    return this.scheduled.delete(workflowId);
  }
}
