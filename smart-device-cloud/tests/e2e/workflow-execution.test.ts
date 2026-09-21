import { describe, it, expect } from 'vitest';
import { InMemoryWorkflowEngine } from '../../packages/workflow-engine/src/index';

describe('workflow execution e2e', () => {
  it('creates and executes a workflow', async () => {
    const engine = new InMemoryWorkflowEngine();

    const workflow = engine.create({
      name: 'Smoke Test',
      steps: [{ id: 's1', type: 'execute_test', config: {} }],
      trigger: { type: 'manual' },
      status: 'active',
    });

    expect(workflow.id).toMatch(/^wf-/);

    const execution = await engine.execute(workflow.id);
    expect(execution.workflowId).toBe(workflow.id);
    expect(execution.status).toBe('running');
  });

  it('throws when executing unknown workflow', async () => {
    const engine = new InMemoryWorkflowEngine();
    await expect(engine.execute('nonexistent')).rejects.toThrow('Workflow not found');
  });
});
