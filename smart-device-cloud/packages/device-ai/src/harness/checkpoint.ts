export interface Checkpoint {
  id: string;
  workflowId: string;
  stepId: string;
  state: Record<string, unknown>;
  createdAt: string;
}

export class AiCheckpointStore {
  private readonly checkpoints = new Map<string, Checkpoint>();

  save(checkpoint: Checkpoint): void {
    this.checkpoints.set(checkpoint.id, { ...checkpoint, state: { ...checkpoint.state } });
  }

  get(id: string): Checkpoint | undefined {
    const checkpoint = this.checkpoints.get(id);
    return checkpoint ? { ...checkpoint, state: { ...checkpoint.state } } : undefined;
  }

  latest(workflowId: string): Checkpoint | undefined {
    return Array.from(this.checkpoints.values())
      .filter(checkpoint => checkpoint.workflowId === workflowId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }
}
