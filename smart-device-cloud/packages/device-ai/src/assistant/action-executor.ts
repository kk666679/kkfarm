import type { RecommendationAction } from '../types';

export interface ActionAuthorization {
  actorId: string;
  approved: boolean;
  reason?: string;
}

export class AssistantActionExecutor {
  constructor(
    private readonly execute: (
      action: RecommendationAction,
      authorization: ActionAuthorization
    ) => Promise<unknown>
  ) {}

  async executeAction(
    action: RecommendationAction,
    authorization: ActionAuthorization
  ): Promise<{ success: boolean; result?: unknown }> {
    if (!authorization.approved) return { success: false };
    return { success: true, result: await this.execute(action, authorization) };
  }
}
