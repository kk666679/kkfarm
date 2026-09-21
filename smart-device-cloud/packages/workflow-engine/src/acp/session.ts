import type { AcpWorkflowMessage } from './protocol';

export class AcpWorkflowSession {
  private readonly messages: AcpWorkflowMessage[] = [];

  send(message: AcpWorkflowMessage): void {
    this.messages.push({ ...message, payload: { ...message.payload } });
  }

  history(workflowId?: string): AcpWorkflowMessage[] {
    return this.messages
      .filter(message => !workflowId || message.workflowId === workflowId)
      .map(message => ({ ...message, payload: { ...message.payload } }));
  }
}
