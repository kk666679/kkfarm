'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { PenTool } from 'lucide-react';
import type { ContentPlatformId } from '../types';

export type ContentPostNodeData = {
  label: string;
  config: {
    topic?: string;
    platforms?: ContentPlatformId[];
    tone?: 'professional' | 'casual' | 'witty' | 'inspirational';
    hookVariations?: number;
    includeHashtags?: boolean;
    includeVisual?: boolean;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  output?: { posts?: Array<{ platform: ContentPlatformId; content: string; hashtags: string[] }> };
  tokensUsed?: number;
  cost?: number;
  error?: string;
};

export type ContentPostNodeType = Node<ContentPostNodeData, 'content-post'>;

export const ContentPostNode = memo(({ data, selected }: NodeProps<ContentPostNodeType>) => {
  const count = data.config.platforms?.length ?? 0;
  return (
    <div
      className={cn(
        'min-w-[260px] max-w-[320px] overflow-hidden rounded-lg border border-fuchsia-500/30 bg-card shadow-sm',
        selected && 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background',
        data.status === 'error' && 'border-destructive/50',
        data.status === 'success' && 'border-emerald-500/50'
      )}
    >
      <NodeHeader
        icon={<PenTool className="h-3 w-3 text-fuchsia-500" />}
        title={data.label}
        subtitle={count > 0 ? `${count} platform${count === 1 ? '' : 's'}` : 'no platforms'}
        status={data.status}
        variant="content"
      />
      <div className="space-y-1 px-3 py-2 text-[11px]">
        {data.config.topic && (
          <p className="line-clamp-2 text-muted-foreground">{data.config.topic}</p>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tone</span>
          <span className="font-medium capitalize">{data.config.tone ?? '—'}</span>
        </div>
        {data.output?.posts && (
          <p className="text-muted-foreground">{data.output.posts.length} posts generated</p>
        )}
        {data.cost != null && (
          <p className="text-muted-foreground">
            ${data.cost.toFixed(4)} · {data.tokensUsed?.toLocaleString() ?? 0} tokens
          </p>
        )}
        {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
      </div>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-fuchsia-500" />
    </div>
  );
});
ContentPostNode.displayName = 'ContentPostNode';
