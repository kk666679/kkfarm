export interface WorkflowTrace {
  id: string;
  workflowId: string;
  executionId?: string;
  operation: string;
  timestamp: string;
}

export class WorkflowTracer {
  private readonly traces: WorkflowTrace[] = [];

  record(workflowId: string, operation: string, executionId?: string): WorkflowTrace {
    const trace: WorkflowTrace = {
      id: `workflow-trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      workflowId,
      ...(executionId ? { executionId } : {}),
      operation,
      timestamp: new Date().toISOString(),
    };
    this.traces.push(trace);
    return { ...trace };
  }

  list(workflowId?: string): WorkflowTrace[] {
    return this.traces
      .filter(trace => !workflowId || trace.workflowId === workflowId)
      .map(trace => ({ ...trace }));
  }
}
