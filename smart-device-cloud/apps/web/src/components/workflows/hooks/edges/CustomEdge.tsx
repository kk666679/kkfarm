'use client';
import { BaseEdge, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react';

export type StraightEdgeData = {
  label?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
};

export type StraightEdge = Edge<StraightEdgeData, 'straight'>;

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  markerStart,
  selected,
}: EdgeProps<StraightEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerStart={markerStart}
      markerEnd={markerEnd}
      style={{
        strokeWidth: selected ? 3 : 2,
        stroke: 'var(--edge-idle, #94a3b8)',
      }}
    />
  );
}
