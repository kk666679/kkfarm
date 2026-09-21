'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Send } from 'lucide-react';
import type { ContentPlatformId } from '../types';

export type ContentPublishNodeData = {
  label: string;
  config: {
    platforms?: ContentPlatformId[];
    accountIds?: Record<string, string>;
    requireApproval?: boolean;
  };
  status?: 'idle' | 'running' | 'success' | 'partial' | 'error';
  output?: {
    published?: Array<{ platform: string; postId: string; url: string }>;
    failed?: Array<{ platform: string; error: string }>;
  };
  error?: string;
};

export type ContentPublishNodeType = Node<ContentPublishNodeData, 'content-publish'>;

export const ContentPublishNode = memo(({ data, selected }: NodeProps<ContentPublishNodeType>) => {
  const published = data.output?.published?.length ?? 0;
  const failed = data.output?.failed?.length ?? 0;
  const total = data.config.platforms?.length ?? 0;
  return (
    <div
      className={cn(
        'min-w-[260px] overflow-hidden rounded-lg border border-fuchsia-500/30 bg-card shadow-sm',
        selected && 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background',
        data.status === 'error' && 'border-destructive/50',
        data.status === 'success' && 'border-emerald-500/50',
        data.status === 'partial' && 'border-amber-500/50'
      )}
    >
      <NodeHeader
        icon={<Send className="h-3 w-3 text-fuchsia-500" />}
        title={data.label}
        subtitle={`${published}/${total} published${failed > 0 ? ` · ${failed} failed` : ''}`}
        status={data.status as any}
        variant="content"
      />
      <div className="space-y-1 px-3 py-2 text-[11px]">
        <div className="flex flex-wrap gap-1">
          {data.config.platforms?.map(p => (
            <span key={p} className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize">
              {p}
            </span>
          ))}
        </div>
        {data.config.requireApproval && (
          <p className="text-amber-600 dark:text-amber-400">Requires approval</p>
        )}
        {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
      </div>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-fuchsia-500" />
    </div>
  );
});
ContentPublishNode.displayName = 'ContentPublishNode';
