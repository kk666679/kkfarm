export class ReplayProtection {
  private readonly seen = new Map<string, number>();

  accept(eventId: string, now = Date.now()): boolean {
    const previous = this.seen.get(eventId);
    if (previous && now - previous < 24 * 60 * 60 * 1000) return false;
    this.seen.set(eventId, now);
    return true;
  }
}
