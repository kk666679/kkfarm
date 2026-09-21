'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Plug } from 'lucide-react';

export type IntegrationNodeData = {
  label: string;
  config: {
    provider?: 'slack' | 'jira' | 'gitlab' | 'datadog' | 'webhook';
    action?: string;
    params?: Record<string, unknown>;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  error?: string;
};

export type IntegrationNodeType = Node<IntegrationNodeData, 'integration'>;

export const IntegrationNode = memo(({ data, selected }: NodeProps<IntegrationNodeType>) => (
  <div
    className={cn(
      'min-w-[220px] overflow-hidden rounded-lg border bg-card shadow-sm',
      selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      data.status === 'error' && 'border-destructive/50'
    )}
  >
    <NodeHeader
      icon={<Plug className="h-3 w-3" />}
      title={data.label}
      subtitle={data.config.provider}
      status={data.status}
    />
    <div className="space-y-1 px-3 py-2 text-[11px]">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Action</span>
        <span className="font-medium">{data.config.action ?? '—'}</span>
      </div>
      {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
    </div>
    <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
    <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary" />
  </div>
));
IntegrationNode.displayName = 'IntegrationNode';
