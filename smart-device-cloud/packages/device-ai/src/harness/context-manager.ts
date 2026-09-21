export interface AiContext {
  tenantId: string;
  deviceId?: string;
  workflowId?: string;
  userId?: string;
  data: Record<string, unknown>;
}

export class AiContextManager {
  private readonly contexts = new Map<string, AiContext>();

  put(context: AiContext): AiContext {
    const stored = { ...context, data: { ...context.data } };
    this.contexts.set(context.tenantId, stored);
    return { ...stored, data: { ...stored.data } };
  }

  get(tenantId: string): AiContext | undefined {
    const context = this.contexts.get(tenantId);
    return context ? { ...context, data: { ...context.data } } : undefined;
  }

  clear(tenantId: string): boolean {
    return this.contexts.delete(tenantId);
  }
}
