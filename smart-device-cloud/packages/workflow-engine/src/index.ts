import { InMemoryWorkflowEngine } from './execution/engine';
export * from './types';
export * from './graph/graph';
export * from './graph/validator';
export * from './graph/topological-executor';
export * from './graph/conditional-edges';
export * from './execution/engine';
export * from './execution/step-runner';
export * from './execution/checkpoint';
export * from './execution/saga';
export * from './execution/state-machine';
export * from './nodes/registry';
export * from './triggers/cron';
export * from './triggers/webhook';
export * from './triggers/event';
export * from './triggers/acp';
export * from './scheduler/scheduler';
export * from './scheduler/queue';
export * from './acp/protocol';
export * from './acp/session';
export * from './acp/stream';
export * from './observability/tracer';
export * from './observability/metrics';

let sequence = 0;

export class InMemoryWorkflowEngineFacade {
  private readonly engine = new InMemoryWorkflowEngine();

  create(input: Parameters<InMemoryWorkflowEngine['create']>[0]) {
    sequence += 1;
    return this.engine.create(input);
  }

  get(id: string) {
    return this.engine.get(id);
  }

  list() {
    return this.engine.list();
  }

  execute(id: string) {
    return this.engine.execute(id);
  }
}

export { InMemoryWorkflowEngine };
export default InMemoryWorkflowEngine;
