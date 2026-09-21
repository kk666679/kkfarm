import type { WorkflowStep } from '../types';

export class TopologicalWorkflowExecutor {
  order(steps: readonly WorkflowStep[]): WorkflowStep[] {
    const byId = new Map(steps.map(step => [step.id, step]));
    const indegree = new Map<string, number>(
      steps.map(step => [step.id, (step.dependencies ?? []).length])
    );
    const outgoing = new Map<string, string[]>();
    for (const step of steps) {
      outgoing.set(step.id, [
        ...new Set([
          ...(step.nextSteps ?? []),
          ...(step.dependencies ?? []).map(dependency => dependency),
        ]),
      ]);
      for (const dependency of step.dependencies ?? [])
        if (!outgoing.has(dependency)) outgoing.set(dependency, []);
    }
    const queue = steps.filter(step => indegree.get(step.id) === 0).map(step => step.id);
    const result: WorkflowStep[] = [];
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) break;
      const step = byId.get(id);
      if (step) result.push(step);
      for (const next of outgoing.get(id) ?? []) {
        const nextStep = byId.get(next);
        if (!nextStep) continue;
        const nextDependencies = nextStep.dependencies ?? [];
        const remaining = nextDependencies.filter(dependency => dependency !== id);
        indegree.set(next, remaining.length);
        if (remaining.length === 0) queue.push(next);
      }
    }
    if (result.length !== steps.length) throw new Error('Workflow graph is not acyclic');
    return result;
  }
}
