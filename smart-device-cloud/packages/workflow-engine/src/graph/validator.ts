import type { WorkflowStep } from '../types';

export class WorkflowValidator {
  validate(steps: readonly WorkflowStep[]): string[] {
    const errors: string[] = [];
    const ids = new Set<string>();
    for (const step of steps) {
      if (!step.id.trim()) errors.push('Workflow step ID is required');
      if (ids.has(step.id)) errors.push(`Duplicate workflow step ID: ${step.id}`);
      ids.add(step.id);
      if (step.timeoutMs !== undefined && step.timeoutMs <= 0)
        errors.push(`Step timeout must be positive: ${step.id}`);
      if (step.retryCount !== undefined && step.retryCount < 0)
        errors.push(`Step retry count cannot be negative: ${step.id}`);
    }
    for (const step of steps) {
      for (const dependency of step.dependencies ?? [])
        if (!ids.has(dependency))
          errors.push(`Unknown dependency ${dependency} in step ${step.id}`);
      for (const next of step.nextSteps ?? [])
        if (!ids.has(next)) errors.push(`Unknown next step ${next} in step ${step.id}`);
    }
    if (this.hasCycle(steps)) errors.push('Workflow graph contains a cycle');
    return errors;
  }

  private hasCycle(steps: readonly WorkflowStep[]): boolean {
    const adjacency = new Map<string, string[]>();
    for (const step of steps)
      adjacency.set(step.id, [
        ...(step.nextSteps ?? []),
        ...(step.dependencies ?? []).map(dependency => dependency),
      ]);
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;
      visiting.add(id);
      for (const next of adjacency.get(id) ?? []) if (visit(next)) return true;
      visiting.delete(id);
      visited.add(id);
      return false;
    };
    return Array.from(adjacency.keys()).some(id => visit(id));
  }
}
