import type { Workflow, WorkflowExecution, WorkflowStep, WorkflowStepResult } from '../types';
import { WorkflowValidator } from '../graph/validator';
import { TopologicalWorkflowExecutor } from '../graph/topological-executor';
import { ConditionalEdges } from '../graph/conditional-edges';
import { WorkflowCheckpointStore } from './checkpoint';
import { WorkflowSaga } from './saga';
import { WorkflowStateMachine } from './state-machine';
import { NoOpStepRunner, type StepRunner } from './step-runner';

export interface WorkflowEngine {
  create(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow;
  get(id: string): Workflow | undefined;
  list(): Workflow[];
  update(id: string, updates: Partial<Workflow>): Workflow | undefined;
  remove(id: string): boolean;
  execute(id: string): Promise<WorkflowExecution>;
}

export class InMemoryWorkflowEngine implements WorkflowEngine {
  private readonly workflows = new Map<string, Workflow>();
  private readonly executions = new Map<string, WorkflowExecution>();
  private readonly runners = new Map<string, StepRunner>();
  private readonly checkpoints = new WorkflowCheckpointStore();
  private readonly validator = new WorkflowValidator();
  private readonly topological = new TopologicalWorkflowExecutor();
  private readonly conditional = new ConditionalEdges();
  private readonly saga: WorkflowSaga;

  constructor() {
    this.saga = new WorkflowSaga(async () => undefined);
  }

  registerRunner(type: string, runner: StepRunner): void {
    this.runners.set(type, runner);
  }

  create(input: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow {
    const errors = this.validator.validate(input.steps);
    if (errors.length > 0) throw new Error(errors.join('; '));
    const now = new Date().toISOString();
    const workflow: Workflow = {
      ...input,
      id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: input.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      steps: input.steps.map(step => ({
        ...step,
        ...(step.dependencies ? { dependencies: [...step.dependencies] } : {}),
        ...(step.nextSteps ? { nextSteps: [...step.nextSteps] } : {}),
        config: { ...step.config },
      })),
    };
    this.workflows.set(workflow.id, workflow);
    return {
      ...workflow,
      steps: workflow.steps.map(step => ({
        ...step,
        ...(step.dependencies ? { dependencies: [...step.dependencies] } : {}),
        ...(step.nextSteps ? { nextSteps: [...step.nextSteps] } : {}),
        config: { ...step.config },
      })),
    };
  }

  get(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  list(): Workflow[] {
    return Array.from(this.workflows.values()).map(workflow => ({
      ...workflow,
      steps: workflow.steps.map(step => ({ ...step, config: { ...step.config } })),
    }));
  }

  update(id: string, updates: Partial<Workflow>): Workflow | undefined {
    const existing = this.workflows.get(id);
    if (!existing) return undefined;
    const candidate = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const errors = this.validator.validate(candidate.steps);
    if (errors.length > 0) throw new Error(errors.join('; '));
    this.workflows.set(id, candidate);
    return {
      ...candidate,
      steps: candidate.steps.map(step => ({ ...step, config: { ...step.config } })),
    };
  }

  remove(id: string): boolean {
    return this.workflows.delete(id);
  }

  async execute(id: string): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(id);
    if (!workflow) throw new Error(`Workflow not found: ${id}`);
    if (workflow.status === 'disabled' || workflow.status === 'cancelled')
      throw new Error(`Workflow cannot execute from ${workflow.status}`);
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      workflowId: id,
      status: 'running',
      startedAt: new Date().toISOString(),
      stepResults: {},
    };
    this.executions.set(execution.id, execution);
    const ordered = this.topological.order(workflow.steps);
    const completed: string[] = [];
    for (const step of ordered) {
      if (!this.conditional.shouldRun(step, execution.stepResults ?? {})) {
        execution.stepResults![step.id] = { status: 'skipped' };
        continue;
      }
      const result = await this.runStep(step, workflow, execution);
      execution.stepResults![step.id] = result;
      if (result.status === 'completed') completed.push(step.id);
      else {
        execution.status = 'failed';
        execution.error = result.error ?? `Step failed: ${step.id}`;
        execution.completedAt = new Date().toISOString();
        await this.saga.rollback(execution, workflow.steps, completed);
        break;
      }
    }
    if (execution.status === 'running') {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
    }
    const existingWorkflow = this.workflows.get(id);
    if (existingWorkflow)
      this.workflows.set(id, {
        ...existingWorkflow,
        status: execution.status === 'completed' ? 'active' : existingWorkflow.status,
        updatedAt: new Date().toISOString(),
        executionHistory: [...(existingWorkflow.executionHistory ?? []), execution],
      });
    return {
      ...execution,
      stepResults: Object.fromEntries(
        Object.entries(execution.stepResults ?? {}).map(([key, value]) => [key, { ...value }])
      ),
    };
  }

  private async runStep(
    step: WorkflowStep,
    workflow: Workflow,
    execution: WorkflowExecution
  ): Promise<WorkflowStepResult> {
    const startedAt = new Date().toISOString();
    const runner = this.runners.get(step.type) ?? new NoOpStepRunner();
    try {
      const result = await runner.runStep(step, {
        workflow,
        execution,
        variables: execution.stepResults ?? {},
      });
      return {
        status: result.success ? 'completed' : 'failed',
        startedAt,
        completedAt: new Date().toISOString(),
        output: result.data,
        ...(result.error ? { error: result.error } : {}),
      };
    } catch (error) {
      return {
        status: 'failed',
        startedAt,
        completedAt: new Date().toISOString(),
        ...(error instanceof Error ? { error: error.message } : { error: String(error) }),
      };
    }
  }
}

export { WorkflowCheckpointStore, WorkflowSaga, WorkflowStateMachine };
export type { StepResult, WorkflowContext } from '../types';
export type { StepRunner } from './step-runner';
