export interface AcpTrigger {
  agentId: string;
  topic: string;
}

export class AcpTriggerHandler {
  constructor(private readonly trigger: AcpTrigger) {}

  accepts(agentId: string, topic: string): boolean {
    return agentId === this.trigger.agentId && topic === this.trigger.topic;
  }
}
