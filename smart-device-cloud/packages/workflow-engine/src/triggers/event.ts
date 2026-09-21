export interface EventTrigger {
  source: string;
  eventType: string;
}

export class EventTriggerMatcher {
  constructor(private readonly trigger: EventTrigger) {}

  matches(source: string, eventType: string): boolean {
    return source === this.trigger.source && eventType === this.trigger.eventType;
  }
}
