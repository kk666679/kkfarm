'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { ShieldCheck } from 'lucide-react';

export type GateNodeData = {
  label: string;
  config: {
    action?: string;
    reason?: string;
    approvers?: string[];
    timeoutMs?: number;
  };
  status?: 'idle' | 'pending' | 'approved' | 'rejected' | 'timeout';
};

export type GateNodeType = Node<GateNodeData, 'gate'>;

export const GateNode = memo(({ data, selected }: NodeProps<GateNodeType>) => (
  <div
    className={cn(
      'min-w-[220px] overflow-hidden rounded-lg border border-amber-500/40 bg-amber-500/5 shadow-sm',
      selected && 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background'
    )}
  >
    <NodeHeader
      icon={<ShieldCheck className="h-3 w-3 text-amber-500" />}
      title={data.label}
      subtitle="Approval required"
      status={
        data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'error' : 'idle'
      }
      variant="warning"
    />
    <div className="space-y-1 px-3 py-2 text-[11px]">
      {data.config.reason && (
        <p className="line-clamp-2 text-muted-foreground">{data.config.reason}</p>
      )}
      <p className="text-muted-foreground capitalize">{data.status ?? 'pending'}</p>
    </div>
    <Handle
      type="target"
      position={Position.Left}
      id="input"
      className="!h-2 !w-2 !bg-muted-foreground"
    />
    <Handle
      type="source"
      position={Position.Right}
      id="approved"
      style={{ top: '40%' }}
      className="!h-2 !w-2 !bg-emerald-500"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="rejected"
      className="!h-2 !w-2 !bg-destructive"
    />
  </div>
));
GateNode.displayName = 'GateNode';
