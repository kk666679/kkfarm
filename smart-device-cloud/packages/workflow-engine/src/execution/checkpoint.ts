export interface WorkflowCheckpoint {
  id: string;
  workflowId: string;
  executionId: string;
  stepId: string;
  state: Record<string, unknown>;
  createdAt: string;
}

export class WorkflowCheckpointStore {
  private readonly checkpoints = new Map<string, WorkflowCheckpoint>();

  save(checkpoint: WorkflowCheckpoint): void {
    this.checkpoints.set(checkpoint.id, { ...checkpoint, state: { ...checkpoint.state } });
  }

  get(id: string): WorkflowCheckpoint | undefined {
    const checkpoint = this.checkpoints.get(id);
    return checkpoint ? { ...checkpoint, state: { ...checkpoint.state } } : undefined;
  }

  latest(executionId: string): WorkflowCheckpoint | undefined {
    return Array.from(this.checkpoints.values())
      .filter(checkpoint => checkpoint.executionId === executionId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }
}
