export class ControlHandler {
  constructor({ seats } = {}) {
    this.seats = seats;
    this.state = 'running';
  }

  async halt({ reason, actor }) {
    this.state = 'halted';
    return { halted: true, reason, actor, timestamp: Date.now() };
  }

  async resume() {
    this.state = 'running';
    return { resumed: true, timestamp: Date.now() };
  }
}
