'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Sparkles } from 'lucide-react';

export type AiNodeData = {
  label: string;
  config: {
    model?: string;
    prompt?: string;
    schema?: Record<string, unknown>;
    maxTokens?: number;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  output?: unknown;
  error?: string;
  tokensUsed?: number;
  cost?: number;
};

export type AiNodeType = Node<AiNodeData, 'ai'>;

export const AiNode = memo(({ data, selected }: NodeProps<AiNodeType>) => (
  <div
    className={cn(
      'min-w-[240px] max-w-[300px] overflow-hidden rounded-lg border border-violet-500/30 bg-card shadow-sm',
      selected && 'ring-2 ring-violet-500 ring-offset-2 ring-offset-background',
      data.status === 'error' && 'border-destructive/50'
    )}
  >
    <NodeHeader
      icon={<Sparkles className="h-3 w-3 text-violet-500" />}
      title={data.label}
      subtitle={data.config.model}
      status={data.status}
    />
    <div className="space-y-1 px-3 py-2 text-[11px]">
      {data.config.prompt && (
        <p className="line-clamp-2 text-muted-foreground">{data.config.prompt}</p>
      )}
      {data.tokensUsed != null && (
        <p className="text-muted-foreground">
          {data.tokensUsed.toLocaleString()} tokens
          {data.cost != null && ` · $${data.cost.toFixed(4)}`}
        </p>
      )}
      {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
    </div>
    <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
    <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-violet-500" />
  </div>
));
AiNode.displayName = 'AiNode';
