import type { AiRecommendation } from '../types';

export function validateRecommendation(
  recommendation: Omit<AiRecommendation, 'id' | 'createdAt'>
): string[] {
  const errors: string[] = [];
  if (recommendation.confidence < 0 || recommendation.confidence > 1)
    errors.push('Confidence must be between 0 and 1');
  if (recommendation.score < 0 || recommendation.score > 100)
    errors.push('Score must be between 0 and 100');
  if (!recommendation.reason.trim() || !recommendation.description.trim())
    errors.push('Recommendation explanation is required');
  if (recommendation.affectedDeviceCount < 1) errors.push('Affected device count must be positive');
  return errors;
}
