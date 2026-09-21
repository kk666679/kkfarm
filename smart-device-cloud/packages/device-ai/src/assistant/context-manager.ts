import type { AiContext } from '../harness/context-manager';

export class AssistantContextManager {
  private contexts = new Map<string, AiContext>();

  update(context: AiContext): AiContext {
    const current = this.contexts.get(context.tenantId);
    const merged = { ...context, data: { ...(current?.data ?? {}), ...context.data } };
    this.contexts.set(context.tenantId, merged);
    return { ...merged, data: { ...merged.data } };
  }

  get(tenantId: string): AiContext | undefined {
    const context = this.contexts.get(tenantId);
    return context ? { ...context, data: { ...context.data } } : undefined;
  }
}
