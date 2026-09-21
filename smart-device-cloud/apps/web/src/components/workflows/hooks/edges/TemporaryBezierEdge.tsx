'use client';
import { getBezierPath, type ConnectionLineComponentProps } from '@xyflow/react';

export function TemporaryBezierEdge({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
}: ConnectionLineComponentProps) {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      <path
        d={edgePath}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        strokeLinecap="round"
        className="react-flow__connection-path"
      />
      <circle
        cx={toX}
        cy={toY}
        r={4}
        fill="#94a3b8"
        stroke="#fff"
        strokeWidth={1.5}
        opacity={0.9}
      />
    </g>
  );
}
