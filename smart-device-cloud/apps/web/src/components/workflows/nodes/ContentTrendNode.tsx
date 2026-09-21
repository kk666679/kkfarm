'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Flame } from 'lucide-react';

export type ContentTrendNodeData = {
  label: string;
  config: {
    sources?: Array<'tiktok' | 'instagram' | 'youtube' | 'x' | 'reddit'>;
    keywords?: string[];
    minVolume?: number;
    lookbackHours?: number;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  output?: {
    trends?: Array<{ topic: string; volume: number; velocity: number; platform: string }>;
  };
  error?: string;
};

export type ContentTrendNodeType = Node<ContentTrendNodeData, 'content-trend'>;

export const ContentTrendNode = memo(({ data, selected }: NodeProps<ContentTrendNodeType>) => {
  const count = data.output?.trends?.length ?? 0;
  return (
    <div
      className={cn(
        'min-w-[240px] overflow-hidden rounded-lg border border-fuchsia-500/30 bg-card shadow-sm',
        selected && 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background',
        data.status === 'error' && 'border-destructive/50'
      )}
    >
      <NodeHeader
        icon={<Flame className="h-3 w-3 text-fuchsia-500" />}
        title={data.label}
        subtitle={count > 0 ? `${count} trends detected` : data.config.sources?.join(', ')}
        status={data.status}
        variant="content"
      />
      <div className="space-y-1 px-3 py-2 text-[11px]">
        {data.config.keywords && data.config.keywords.length > 0 && (
          <p className="line-clamp-1 text-muted-foreground">{data.config.keywords.join(', ')}</p>
        )}
        {data.output?.trends && data.output.trends.length > 0 && (
          <div className="space-y-0.5">
            {data.output.trends.slice(0, 2).map((t, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="truncate">{t.topic}</span>
                <span className="shrink-0 text-muted-foreground">{t.platform}</span>
              </div>
            ))}
          </div>
        )}
        {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
      </div>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-fuchsia-500" />
    </div>
  );
});
ContentTrendNode.displayName = 'ContentTrendNode';
