import type { AiRecommendation, ReviewDecision } from '../types';

export class RecommendationReviewGate {
  review(recommendation: AiRecommendation, decision: ReviewDecision): AiRecommendation {
    if (decision.decision === 'approve')
      return {
        ...recommendation,
        status: 'reviewed',
        reviewedAt: decision.reviewedAt,
        authorizedBy: decision.reviewerId,
      };
    if (decision.decision === 'reject')
      return {
        ...recommendation,
        status: 'dismissed',
        reviewedAt: decision.reviewedAt,
        authorizedBy: decision.reviewerId,
      };
    return recommendation;
  }

  canApply(recommendation: AiRecommendation): boolean {
    return recommendation.status === 'reviewed' && recommendation.authorizedBy !== undefined;
  }
}
