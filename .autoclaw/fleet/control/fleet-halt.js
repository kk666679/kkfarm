export class FleetHalt {
  constructor() {
    this.halted = false;
    this.reason = null;
    this.haltedAt = null;
  }

  halt({ reason, actor }) {
    this.halted = true;
    this.reason = reason;
    this.haltedAt = Date.now();
    this.actor = actor;
    return { halted: true, reason, actor };
  }
}
