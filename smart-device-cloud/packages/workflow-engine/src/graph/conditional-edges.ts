import type { WorkflowStep } from '../types';

export class ConditionalEdges {
  shouldRun(step: WorkflowStep, variables: Readonly<Record<string, unknown>>): boolean {
    const condition = step.config.condition;
    if (!condition || typeof condition !== 'object') return true;
    const record = condition as Record<string, unknown>;
    const key = record.key;
    if (typeof key !== 'string') return true;
    if (typeof record.equals === 'string') return variables[key] === record.equals;
    if (typeof record.notEquals === 'string') return variables[key] !== record.notEquals;
    if (typeof record.truthy === 'string') return Boolean(variables[record.truthy]);
    return true;
  }
}
