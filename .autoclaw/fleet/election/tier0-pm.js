export class Tier0PM {
  constructor() {
    this.decisions = [];
  }

  decide(proposal) {
    const decision = { ...proposal, decidedAt: Date.now(), approved: true };
    this.decisions.push(decision);
    return decision;
  }
}
