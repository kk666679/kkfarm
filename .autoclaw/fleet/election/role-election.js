export class RoleElection {
  constructor({ seats } = {}) {
    this.seats = seats;
  }

  async elect({ role, candidates }) {
    const winner = candidates[0] ?? null;
    return { role, winner, electedAt: Date.now() };
  }
}
