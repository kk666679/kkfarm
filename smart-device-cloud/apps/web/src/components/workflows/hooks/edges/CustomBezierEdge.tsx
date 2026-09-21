'use client';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
import { cn } from '@/lib/utils';

export type EdgeStatus = 'idle' | 'running' | 'success' | 'error';

export type BezierEdgeData = {
  label?: string;
  condition?: string;
  status?: EdgeStatus;
  animated?: boolean;
  progress?: number;
};

export type BezierEdge = Edge<BezierEdgeData, 'bezier'>;

const STROKE_BY_STATUS: Record<EdgeStatus, string> = {
  idle: 'var(--edge-idle, #94a3b8)',
  running: 'var(--edge-running, #3b82f6)',
  success: 'var(--edge-success, #10b981)',
  error: 'var(--edge-error, #ef4444)',
};

export function CustomBezierEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  markerStart,
  markerEnd,
  selected,
  interactionWidth = 20,
}: EdgeProps<BezierEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const status: EdgeStatus = data?.status ?? 'idle';
  const stroke = STROKE_BY_STATUS[status];
  const width = selected ? 3 : 2;
  const isAnimated = data?.animated ?? status === 'running';
  const progress = data?.progress;

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={interactionWidth}
        className="react-flow__edge-interaction"
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{
          strokeWidth: width,
          stroke,
          strokeDasharray: isAnimated ? '6 4' : undefined,
          strokeLinecap: 'round',
          transition: 'stroke 150ms ease, stroke-width 150ms ease',
        }}
        className={cn(
          isAnimated && 'react-flow__edge--animated',
          status === 'error' && 'react-flow__edge--error'
        )}
      />
      {progress !== undefined && (
        <path
          d={edgePath}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          pathLength={1}
          style={{
            strokeDasharray: `${progress} 1`,
            strokeLinecap: 'round',
            transition: 'stroke-dasharray 300ms ease',
          }}
          aria-hidden="true"
        />
      )}
      {(data?.label || data?.condition) && (
        <EdgeLabelRenderer>
          <div
            role="note"
            className="nodrag nopan pointer-events-auto absolute flex flex-col items-center gap-1 rounded border border-white/10 bg-white/90 px-2 py-0.5 text-xs shadow-sm backdrop-blur dark:border-gray-700/50 dark:bg-gray-800/90"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data?.condition && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {data.condition}
              </span>
            )}
            {data?.label && <span className="text-xs font-medium">{data.label}</span>}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
