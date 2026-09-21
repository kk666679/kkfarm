export class Quorum {
  constructor({ required = 2 } = {}) {
    this.required = required;
    this.votes = [];
  }

  vote(agentId, vote) {
    this.votes.push({ agentId, vote, timestamp: Date.now() });
    const approvals = this.votes.filter((v) => v.vote).length;
    return { reached: approvals >= this.required, approvals, total: this.votes.length };
  }
}
