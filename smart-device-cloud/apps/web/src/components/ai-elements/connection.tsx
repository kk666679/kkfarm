'use client';

import { getBezierPath, type ConnectionLineComponentProps } from '@xyflow/react';

export const Connection = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
}: ConnectionLineComponentProps) => {
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
        className="animated"
        d={edgePath}
        fill="none"
        stroke="var(--color-ring)"
        strokeWidth={1}
      />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="var(--color-ring)" strokeWidth={1} />
    </g>
  );
};
