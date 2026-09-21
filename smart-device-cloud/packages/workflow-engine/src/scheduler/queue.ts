import type { WorkflowExecution } from '../types';

export class WorkflowQueue {
  private readonly queue: WorkflowExecution[] = [];

  enqueue(execution: WorkflowExecution): void {
    this.queue.push({ ...execution });
  }

  dequeue(): WorkflowExecution | undefined {
    const execution = this.queue.shift();
    return execution ? { ...execution } : undefined;
  }

  pending(): WorkflowExecution[] {
    return this.queue.map(execution => ({ ...execution }));
  }
}
