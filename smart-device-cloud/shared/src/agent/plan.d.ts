import type { AgentPlan, AgentPlanStep, AgentContext } from './task';
export type { AgentPlan, AgentPlanStep, AgentContext };
export interface PlanStepInput {
  [key: string]: unknown;
}
export interface PlanValidationError {
  stepId: string;
  errors: string[];
}
export declare class PlanValidator {
  private steps;
  constructor(steps: AgentPlanStep[]);
  validate(): PlanValidationError[];
  getDependencyOrder(): string[];
}
export declare function createPlanInput(template: Partial<AgentPlan>): Partial<AgentPlan>;
//# sourceMappingURL=plan.d.ts.map
