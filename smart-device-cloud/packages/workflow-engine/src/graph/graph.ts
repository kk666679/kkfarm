import type { Workflow, WorkflowStep } from '../types';

export class WorkflowGraph {
  constructor(readonly steps: WorkflowStep[]) {}

  nodes(): WorkflowStep[] {
    return this.steps.map(step => ({
      ...step,
      ...(step.dependencies ? { dependencies: [...step.dependencies] } : {}),
      ...(step.nextSteps ? { nextSteps: [...step.nextSteps] } : {}),
      config: { ...step.config },
    }));
  }

  dependenciesFor(stepId: string): string[] {
    return this.steps.find(step => step.id === stepId)?.dependencies ?? [];
  }

  outgoingEdges(): Array<{ from: string; to: string }> {
    const edges: Array<{ from: string; to: string }> = [];
    for (const step of this.steps) {
      for (const next of step.nextSteps ?? []) edges.push({ from: step.id, to: next });
      for (const dependency of step.dependencies ?? [])
        edges.push({ from: dependency, to: step.id });
    }
    return edges;
  }
}

export function graphFromWorkflow(workflow: Workflow): WorkflowGraph {
  return new WorkflowGraph(workflow.steps);
}
