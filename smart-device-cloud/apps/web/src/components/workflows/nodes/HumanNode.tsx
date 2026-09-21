'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { User } from 'lucide-react';

export type HumanNodeData = {
  label: string;
  config: {
    assignee?: string;
    instructions?: string;
    timeoutMs?: number;
  };
  status?: 'idle' | 'waiting' | 'completed' | 'timeout';
};

export type HumanNodeType = Node<HumanNodeData, 'human'>;

export const HumanNode = memo(({ data, selected }: NodeProps<HumanNodeType>) => (
  <div
    className={cn(
      'min-w-[220px] overflow-hidden rounded-lg border border-pink-500/30 bg-pink-500/5 shadow-sm',
      selected && 'ring-2 ring-pink-500 ring-offset-2 ring-offset-background'
    )}
  >
    <NodeHeader
      icon={<User className="h-3 w-3 text-pink-500" />}
      title={data.label}
      subtitle={data.config.assignee}
      status={data.status === 'completed' ? 'success' : 'idle'}
    />
    <div className="space-y-1 px-3 py-2 text-[11px]">
      {data.config.instructions && (
        <p className="line-clamp-2 text-muted-foreground">{data.config.instructions}</p>
      )}
    </div>
    <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
    <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-pink-500" />
  </div>
));
HumanNode.displayName = 'HumanNode';
