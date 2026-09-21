import type { WorkflowStatus } from '../types';

export class WorkflowStateMachine {
  static canTransition(from: WorkflowStatus, to: WorkflowStatus): boolean {
    const transitions: Record<WorkflowStatus, WorkflowStatus[]> = {
      draft: ['active', 'disabled'],
      active: ['paused', 'disabled', 'running', 'cancelled'],
      paused: ['active', 'disabled', 'running', 'cancelled'],
      disabled: ['active'],
      running: ['completed', 'failed', 'cancelled'],
      completed: [],
      failed: ['active', 'disabled'],
      cancelled: [],
    };
    return transitions[from]?.includes(to) ?? false;
  }

  static transition(from: WorkflowStatus, to: WorkflowStatus): WorkflowStatus {
    if (!WorkflowStateMachine.canTransition(from, to))
      throw new Error(`Invalid workflow transition: ${from} -> ${to}`);
    return to;
  }
}
