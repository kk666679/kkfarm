export class RateLimiter {
  private readonly timestamps: number[] = [];

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  allow(): boolean {
    const now = Date.now();
    while (this.timestamps.length > 0 && now - (this.timestamps[0] ?? now) >= this.windowMs)
      this.timestamps.shift();
    if (this.timestamps.length >= this.limit) return false;
    this.timestamps.push(now);
    return true;
  }
}
