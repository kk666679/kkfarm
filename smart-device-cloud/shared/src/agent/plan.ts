import type { AgentPlan, AgentPlanStep, AgentContext } from './task';

export type { AgentPlan, AgentPlanStep, AgentContext };

export interface PlanStepInput {
  [key: string]: unknown;
}

export interface PlanValidationError {
  stepId: string;
  errors: string[];
}

export class PlanValidator {
  constructor(private steps: AgentPlanStep[]) {}

  validate(): PlanValidationError[] {
    const errors: PlanValidationError[] = [];
    const stepIds = new Set(this.steps.map(s => s.id));

    for (const step of this.steps) {
      const stepErrors: string[] = [];

      if (!stepIds.has(step.id)) {
        stepErrors.push(`Step ${step.id} references itself`);
      }

      for (const dep of step.dependencies) {
        if (!stepIds.has(dep)) {
          stepErrors.push(`Step ${step.id} depends on unknown step ${dep}`);
        }
      }

      if (stepErrors.length > 0) {
        errors.push({ stepId: step.id, errors: stepErrors });
      }
    }

    return errors;
  }

  getDependencyOrder(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (stepId: string) => {
      if (visited.has(stepId)) return;
      visited.add(stepId);
      const step = this.steps.find(s => s.id === stepId);
      if (step) {
        for (const dep of step.dependencies) {
          visit(dep);
        }
      }
      result.push(stepId);
    };

    for (const step of this.steps) {
      visit(step.id);
    }

    return result;
  }
}

export function createPlanInput(template: Partial<AgentPlan>): Partial<AgentPlan> {
  return {
    ...template,
    steps: template.steps,
  };
}
