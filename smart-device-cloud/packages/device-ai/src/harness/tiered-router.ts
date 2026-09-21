import type { AiModelTier, ModelRoute } from '../types';

export interface TieredRouterOptions {
  routes: Record<AiModelTier, ModelRoute>;
  defaultTier: AiModelTier;
}

export class TieredModelRouter {
  constructor(private readonly options: TieredRouterOptions) {}

  route(
    contextTokens: number,
    outputTokens: number,
    latencyBudgetMs = Number.POSITIVE_INFINITY
  ): AiModelTier {
    const candidates = (Object.keys(this.options.routes) as AiModelTier[]).filter(tier => {
      const route = this.options.routes[tier];
      return (
        contextTokens <= route.maxContextTokens &&
        outputTokens <= route.maxOutputTokens &&
        latencyBudgetMs >= route.latencyBudgetMs
      );
    });
    if (candidates.length === 0) throw new Error('No model tier satisfies the request');
    return candidates.includes(this.options.defaultTier)
      ? this.options.defaultTier
      : (candidates[0] as AiModelTier);
  }

  cost(tier: AiModelTier, tokens: number): number {
    return tokens * this.options.routes[tier].costPerToken;
  }
}
