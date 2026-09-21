import type { StepResult, WorkflowContext, WorkflowStep } from '../types';

export interface StepRunner {
  runStep(step: WorkflowStep, context: WorkflowContext): Promise<StepResult>;
}

export class NoOpStepRunner implements StepRunner {
  async runStep(step: WorkflowStep): Promise<StepResult> {
    await Promise.resolve();
    return { success: true, data: { stepId: step.id, type: step.type } };
  }
}

export class FailingStepRunner implements StepRunner {
  constructor(private readonly message = 'Step runner failed') {}

  async runStep(): Promise<StepResult> {
    return { success: false, error: this.message };
  }
}
