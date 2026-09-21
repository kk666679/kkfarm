import { Seats } from './seats/seats.js';
import { SkillMatcher } from './seats/skill-matcher.js';
import { EvalPromoter } from './seats/eval-promoter.js';
import { Workforce } from './workforce/workforce.js';
import { RoleElection } from './election/role-election.js';
import { ControlHandler } from './control/control-handler.js';
import { Presence } from './presence/beacons.js';
import { MCPFederation } from './federation/mcp-federation.js';
import { ACPFederation } from './federation/acp-federation.js';
import { fleetTracer } from './observability/tracer.js';
import { fleetMetrics } from './observability/metrics.js';

export class Fleet {
  constructor({ config = {} } = {}) {
    this.seats = new Seats({ config });
    this.skillMatcher = new SkillMatcher({ seats: this.seats });
    this.evalPromoter = new EvalPromoter({ seats: this.seats });
    this.workforce = new Workforce({ config });
    this.election = new RoleElection({ seats: this.seats });
    this.control = new ControlHandler({ seats: this.seats });
    this.presence = new Presence({ config });
    this.metrics = { snapshot: async () => fleetMetrics.snapshot() };
    this.mcpFederation = new MCPFederation({ config });
    this.acpFederation = new ACPFederation({ config });
  }

  async assignToSeat({ agent, seatId }) {
    return fleetTracer.startSpan('fleet.assign_seat', async (span) => {
      span.setAttribute('agent.id', agent.id);
      span.setAttribute('seat.id', seatId);

      const seat = await this.seats.get(seatId);
      const match = await this.skillMatcher.match({ agent, seat });

      if (!match.compatible) {
        span.setAttribute('assign.status', 'incompatible');
        return { assigned: false, reason: match.reason };
      }

      const result = await this.seats.assign({ seatId, agentId: agent.id });
      fleetMetrics.increment('fleet.seat.assigned', { seatId, tier: seat.tier });

      span.setAttribute('assign.status', 'ok');
      return result;
    });
  }

  async promoteByEval({ agent, targetTier }) {
    return fleetTracer.startSpan('fleet.promote', async (span) => {
      span.setAttribute('agent.id', agent.id);
      span.setAttribute('target.tier', targetTier);

      const result = await this.evalPromoter.evaluate({ agent, targetTier });
      span.setAttribute('promote.verdict', result.verdict);
      span.setAttribute('promote.score', result.score);

      if (result.verdict === 'promote') {
        await this.seats.promote({ agentId: agent.id, tier: targetTier });
        fleetMetrics.increment('fleet.promoted', { fromTier: agent.tier, toTier: targetTier });
      }

      return result;
    });
  }

  async federateMCP({ remoteFleetUrl, token }) {
    return this.mcpFederation.register({ remoteFleetUrl, token });
  }

  async federateACP({ acpEndpoint }) {
    return this.acpFederation.connect({ acpEndpoint });
  }

  async health() {
    return {
      seats: await this.seats.count(),
      occupancy: await this.seats.occupancy(),
      workforce: await this.workforce.size(),
      online: this.presence.onlineCount(),
      federated: {
        mcp: await this.mcpFederation.count(),
        acp: await this.acpFederation.count(),
      },
      metrics: await this.metrics.snapshot(),
    };
  }

  async halt({ reason, actor }) {
    fleetMetrics.increment('fleet.halted');
    return this.control.halt({ reason, actor });
  }
}
