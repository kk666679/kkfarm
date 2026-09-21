export interface TraceSpan {
  id: string;
  name: string;
  attributes: Record<string, string>;
  startedAt: string;
  endedAt?: string;
}

export class EmulatorTracer {
  private readonly spans: TraceSpan[] = [];

  startSpan(name: string, attributes: Record<string, string> = {}): TraceSpan {
    const span: TraceSpan = {
      id: `span-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      attributes: { ...attributes },
      startedAt: new Date().toISOString(),
    };
    this.spans.push(span);
    return { ...span, attributes: { ...span.attributes } };
  }

  endSpan(id: string): boolean {
    const span = this.spans.find(item => item.id === id);
    if (!span || span.endedAt) return false;
    span.endedAt = new Date().toISOString();
    return true;
  }
}

export const emulatorTracer = new EmulatorTracer();
