export function confidenceLabel(confidence: number): 'low' | 'medium' | 'high' {
  if (confidence < 0 || confidence > 1) throw new Error('Confidence must be between 0 and 1');
  return confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';
}
