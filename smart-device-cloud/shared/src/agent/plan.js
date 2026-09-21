export class PlanValidator {
  steps;
  constructor(steps) {
    this.steps = steps;
  }
  validate() {
    const errors = [];
    const stepIds = new Set(this.steps.map(s => s.id));
    for (const step of this.steps) {
      const stepErrors = [];
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
  getDependencyOrder() {
    const visited = new Set();
    const result = [];
    const visit = stepId => {
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
export function createPlanInput(template) {
  return {
    ...template,
    steps: template.steps,
  };
}
//# sourceMappingURL=plan.js.map
