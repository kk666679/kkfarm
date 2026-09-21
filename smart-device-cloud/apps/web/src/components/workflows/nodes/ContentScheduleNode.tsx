'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { CalendarClock } from 'lucide-react';

export type ContentScheduleNodeData = {
  label: string;
  config: {
    mode?: 'fixed' | 'adaptive' | 'trend-triggered';
    scheduledAt?: string;
    timezone?: string;
    platforms?: string[];
  };
  status?: 'idle' | 'queued' | 'running' | 'success' | 'error';
  output?: { scheduledFor?: string; reason?: string };
  error?: string;
};

export type ContentScheduleNodeType = Node<ContentScheduleNodeData, 'content-schedule'>;

export const ContentScheduleNode = memo(
  ({ data, selected }: NodeProps<ContentScheduleNodeType>) => (
    <div
      className={cn(
        'min-w-[240px] overflow-hidden rounded-lg border border-fuchsia-500/30 bg-card shadow-sm',
        selected && 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background',
        data.status === 'error' && 'border-destructive/50'
      )}
    >
      <NodeHeader
        icon={<CalendarClock className="h-3 w-3 text-fuchsia-500" />}
        title={data.label}
        subtitle={data.config.mode ?? 'adaptive'}
        status={data.status}
        variant="content"
      />
      <div className="space-y-1 px-3 py-2 text-[11px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mode</span>
          <span className="font-medium capitalize">{data.config.mode ?? 'adaptive'}</span>
        </div>
        {data.config.scheduledAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scheduled</span>
            <span className="font-medium">
              {new Date(data.config.scheduledAt).toLocaleString()}
            </span>
          </div>
        )}
        {data.output?.reason && (
          <p className="line-clamp-2 text-muted-foreground">{data.output.reason}</p>
        )}
        {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
      </div>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-fuchsia-500" />
    </div>
  )
);
ContentScheduleNode.displayName = 'ContentScheduleNode';
