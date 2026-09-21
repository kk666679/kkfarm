'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { UserCircle } from 'lucide-react';

export type AccountNodeData = {
  label: string;
  config: {
    action?: 'create' | 'warmup' | 'health-check' | 'retire';
    platform?:
      | 'tiktok'
      | 'instagram'
      | 'youtube'
      | 'linkedin'
      | 'threads'
      | 'facebook'
      | 'shopee'
      | 'shopify';
    deviceId?: string;
    autoWarmup?: boolean;
  };
  status?: 'idle' | 'running' | 'success' | 'error' | 'warmup';
  output?: { accountId?: string; warmupEndsAt?: string; healthScore?: number };
  error?: string;
};

export type AccountNodeType = Node<AccountNodeData, 'account'>;

export const AccountNode = memo(({ data, selected }: NodeProps<AccountNodeType>) => (
  <div
    className={cn(
      'min-w-[240px] overflow-hidden rounded-lg border border-fuchsia-500/30 bg-card shadow-sm',
      selected && 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background',
      data.status === 'error' && 'border-destructive/50',
      data.status === 'success' && 'border-emerald-500/50'
    )}
  >
    <NodeHeader
      icon={<UserCircle className="h-3 w-3 text-fuchsia-500" />}
      title={data.label}
      subtitle={
        data.config.platform
          ? `${data.config.action ?? 'create'} · ${data.config.platform}`
          : undefined
      }
      status={data.status === 'warmup' ? 'running' : (data.status as any)}
      variant="content"
    />
    <div className="space-y-1 px-3 py-2 text-[11px]">
      {data.config.deviceId && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Device</span>
          <span className="truncate font-medium">{data.config.deviceId}</span>
        </div>
      )}
      {data.output?.warmupEndsAt && (
        <p className="text-muted-foreground">
          Warmup until {new Date(data.output.warmupEndsAt).toLocaleDateString()}
        </p>
      )}
      {data.output?.healthScore != null && (
        <p className="text-muted-foreground">
          Health: {Math.round(data.output.healthScore * 100)}%
        </p>
      )}
      {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
    </div>
    <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
    <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-fuchsia-500" />
  </div>
));
AccountNode.displayName = 'AccountNode';
