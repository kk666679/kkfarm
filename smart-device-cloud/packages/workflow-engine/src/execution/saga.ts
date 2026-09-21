import type { WorkflowExecution, WorkflowStep } from '../types';

export interface CompensationResult {
  stepId: string;
  compensated: boolean;
  error?: string;
}

export class WorkflowSaga {
  constructor(
    private readonly compensate: (
      step: WorkflowStep,
      execution: WorkflowExecution
    ) => Promise<unknown>
  ) {}

  async rollback(
    execution: WorkflowExecution,
    steps: readonly WorkflowStep[],
    completedStepIds: readonly string[]
  ): Promise<CompensationResult[]> {
    const results: CompensationResult[] = [];
    for (const stepId of [...completedStepIds].reverse()) {
      const step = steps.find(candidate => candidate.id === stepId);
      if (!step) continue;
      try {
        await this.compensate(step, execution);
        results.push({ stepId, compensated: true });
      } catch (error) {
        results.push({
          stepId,
          compensated: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  }
}
