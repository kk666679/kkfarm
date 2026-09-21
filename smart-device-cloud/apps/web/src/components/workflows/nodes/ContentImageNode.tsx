'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Image as ImageIcon } from 'lucide-react';

export type ContentImageNodeData = {
  label: string;
  config: {
    prompt?: string;
    style?: 'photographic' | 'illustration' | '3d' | 'minimalist';
    aspectRatio?: '1:1' | '9:16' | '16:9' | '4:5';
    count?: number;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  output?: { urls?: string[] };
  cost?: number;
  error?: string;
};

export type ContentImageNodeType = Node<ContentImageNodeData, 'content-image'>;

export const ContentImageNode = memo(({ data, selected }: NodeProps<ContentImageNodeType>) => {
  const count = data.config.count ?? 1;
  return (
    <div
      className={cn(
        'min-w-[240px] max-w-[300px] overflow-hidden rounded-lg border border-fuchsia-500/30 bg-card shadow-sm',
        selected && 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background',
        data.status === 'error' && 'border-destructive/50'
      )}
    >
      <NodeHeader
        icon={<ImageIcon className="h-3 w-3 text-fuchsia-500" />}
        title={data.label}
        subtitle={`${count} image${count === 1 ? '' : 's'} · ${data.config.aspectRatio ?? '1:1'}`}
        status={data.status}
        variant="content"
      />
      <div className="space-y-1 px-3 py-2 text-[11px]">
        {data.config.prompt && (
          <p className="line-clamp-2 text-muted-foreground">{data.config.prompt}</p>
        )}
        {data.output?.urls && data.output.urls.length > 0 && (
          <div className="flex gap-1">
            {data.output.urls.slice(0, 4).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="h-8 w-8 rounded border border-border object-cover"
              />
            ))}
          </div>
        )}
        {data.cost != null && <p className="text-muted-foreground">${data.cost.toFixed(4)}</p>}
        {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
      </div>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-fuchsia-500" />
    </div>
  );
});
ContentImageNode.displayName = 'ContentImageNode';
