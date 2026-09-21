export interface AcpWorkflowMessage {
  id: string;
  type: 'workflow.start' | 'workflow.status' | 'workflow.result';
  workflowId: string;
  payload: Record<string, unknown>;
}

export class AcpWorkflowProtocol {
  encode(message: Omit<AcpWorkflowMessage, 'id'>): AcpWorkflowMessage {
    return { ...message, id: `workflow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  }

  decode(value: unknown): AcpWorkflowMessage {
    if (!value || typeof value !== 'object') throw new Error('Invalid ACP workflow message');
    const message = value as Partial<AcpWorkflowMessage>;
    if (!message.id || !message.type || !message.workflowId || !message.payload)
      throw new Error('Invalid ACP workflow message fields');
    return {
      id: message.id,
      type: message.type,
      workflowId: message.workflowId,
      payload: { ...message.payload },
    };
  }
}
