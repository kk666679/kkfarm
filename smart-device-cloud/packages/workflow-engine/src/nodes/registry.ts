import type { WorkflowStep } from '../types';

export class WorkflowNodeRegistry {
  private readonly nodes = new Map<string, WorkflowStep['type']>();

  register(type: WorkflowStep['type']): void {
    this.nodes.set(type, type);
  }

  has(type: string): boolean {
    return this.nodes.has(type as WorkflowStep['type']);
  }

  list(): WorkflowStep['type'][] {
    return Array.from(this.nodes.values());
  }
}

export class DeviceWorkflowNode extends WorkflowNodeRegistry {}
export class IntegrationWorkflowNode extends WorkflowNodeRegistry {}
export class AiWorkflowNode extends WorkflowNodeRegistry {}
export class BrowserWorkflowNode extends WorkflowNodeRegistry {}
export class EmulatorWorkflowNode extends WorkflowNodeRegistry {}
export class RemoteWorkflowNode extends WorkflowNodeRegistry {}
export class SkillWorkflowNode extends WorkflowNodeRegistry {}
export class GateWorkflowNode extends WorkflowNodeRegistry {}
export class HumanWorkflowNode extends WorkflowNodeRegistry {}
