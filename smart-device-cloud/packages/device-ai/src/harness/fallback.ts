import type { AiModelTier } from '../types';

export class ModelFallback {
  constructor(private readonly order: AiModelTier[]) {}

  next(current: AiModelTier, error: unknown): AiModelTier {
    const index = this.order.indexOf(current);
    const next = this.order[index + 1];
    if (!next) throw error instanceof Error ? error : new Error(String(error));
    return next;
  }
}
