'use client';
import { Background, BackgroundVariant } from '@xyflow/react';

export interface CanvasBackgroundProps {
  variant?: BackgroundVariant;
  gap?: number;
  size?: number;
}

export function CanvasBackground({
  variant = BackgroundVariant.Dots,
  gap = 20,
  size = 1,
}: CanvasBackgroundProps) {
  return <Background variant={variant} gap={gap} size={size} />;
}
