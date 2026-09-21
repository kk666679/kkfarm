'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Zap, Square, GitBranch, Clock, CheckCircle2, Circle } from 'lucide-react';

export type CustomNodeData = {
  label: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'parallel' | 'end';
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  config?: Record<string, unknown>;
  output?: unknown;
  error?: string;
  durationMs?: number;
  isBreakpoint?: boolean;
  isCurrent?: boolean;
};

export type CustomNodeType = Node<CustomNodeData, 'custom'>;

const ICONS = {
  trigger: Zap,
  action: Square,
  condition: GitBranch,
  delay: Clock,
  parallel: Zap,
  end: CheckCircle2,
};

export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeType>) => {
  const Icon = ICONS[data.type] ?? Circle;
  return (
    <div
      className={cn(
        'relative min-w-[200px] max-w-[280px] overflow-hidden rounded-lg border bg-card shadow-sm',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        data.isCurrent && 'ring-2 ring-amber-500',
        data.status === 'error' && 'border-destructive/50',
        data.status === 'success' && 'border-emerald-500/50'
      )}
    >
      <NodeHeader
        icon={<Icon className="h-3 w-3" />}
        title={data.label}
        subtitle={data.type}
        status={data.status}
      />
      <div className="space-y-1 px-3 py-2 text-[11px]">
        {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
        {data.durationMs != null && (
          <p className="text-muted-foreground">
            {data.durationMs < 1000
              ? `${data.durationMs}ms`
              : `${(data.durationMs / 1000).toFixed(2)}s`}
          </p>
        )}
      </div>
      {data.isBreakpoint && (
        <span className="absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-destructive ring-2 ring-background" />
      )}
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary" />
    </div>
  );
});
CustomNode.displayName = 'CustomNode';
