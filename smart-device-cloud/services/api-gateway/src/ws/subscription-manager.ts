export class SubscriptionManager {
  private readonly subs = new Map<string, Set<string>>();

  subscribe(connectionId: string, channel: string): void {
    if (!this.subs.has(channel)) this.subs.set(channel, new Set());
    this.subs.get(channel)!.add(connectionId);
  }

  unsubscribe(connectionId: string, channel: string): void {
    this.subs.get(channel)?.delete(connectionId);
  }

  subscribers(channel: string): string[] {
    return [...(this.subs.get(channel) ?? [])];
  }
}
