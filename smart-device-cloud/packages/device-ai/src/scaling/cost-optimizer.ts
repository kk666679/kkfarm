import type { CostOptimizationResult } from '../types';

export class CostOptimizer {
  optimize(
    resourceId: string,
    currentCost: number,
    utilizationPercent: number
  ): CostOptimizationResult {
    const potentialSavings =
      utilizationPercent < 40
        ? currentCost * 0.25
        : utilizationPercent < 70
          ? currentCost * 0.1
          : 0;
    return {
      resourceId,
      currentCost,
      potentialSavings,
      recommendations:
        potentialSavings > 0
          ? ['Right-size underutilized resources', 'Review idle-time scheduling']
          : ['No immediate cost reduction recommended'],
      timeframe: 'monthly',
    };
  }
}
