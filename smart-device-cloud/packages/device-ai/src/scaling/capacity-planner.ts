import type { ScalingDecision } from '../types';

export class CapacityPlanner {
  plan(decisions: readonly ScalingDecision[]): {
    add: number;
    remove: number;
    estimatedCostImpact: number;
  } {
    return {
      add: decisions
        .filter(decision => decision.recommendedCapacity > 0)
        .reduce((sum, decision) => sum + decision.recommendedCapacity, 0),
      remove: decisions
        .filter(decision => decision.recommendedCapacity < 0)
        .reduce((sum, decision) => sum + Math.abs(decision.recommendedCapacity), 0),
      estimatedCostImpact: decisions.reduce((sum, decision) => sum + decision.costImpact, 0),
    };
  }
}
