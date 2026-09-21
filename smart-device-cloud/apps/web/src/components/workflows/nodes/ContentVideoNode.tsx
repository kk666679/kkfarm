'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Video } from 'lucide-react';

export type VideoProvider = 'seedance' | 'kling' | 'xiaoyunque';

export type ContentVideoNodeData = {
  label: string;
  config: {
    script?: string;
    durationSeconds?: number;
    provider?: VideoProvider;
    characterLocks?: string[];
    aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
    withAudio?: boolean;
  };
  status?: 'idle' | 'running' | 'generating' | 'success' | 'error';
  progress?: number;
  stage?: string;
  output?: { videoUrl?: string; thumbnailUrl?: string; durationMs?: number };
  cost?: number;
  error?: string;
};

export type ContentVideoNodeType = Node<ContentVideoNodeData, 'content-video'>;

export const ContentVideoNode = memo(({ data, selected }: NodeProps<ContentVideoNodeType>) => {
  const isGenerating = data.status === 'running' || data.status === 'generating';
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
        icon={<Video className="h-3 w-3 text-fuchsia-500" />}
        title={data.label}
        subtitle={
          data.config.provider
            ? `${data.config.provider} · ${data.config.durationSeconds ?? 15}s`
            : undefined
        }
        status={isGenerating ? 'running' : (data.status as any)}
        variant="content"
      />
      <div className="space-y-2 px-3 py-2 text-[11px]">
        {data.config.script && (
          <p className="line-clamp-2 text-muted-foreground">{data.config.script}</p>
        )}
        {isGenerating && data.progress != null && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{data.stage ?? 'generating'}</span>
              <span>{Math.round(data.progress * 100)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-fuchsia-500 transition-all"
                style={{ width: `${data.progress * 100}%` }}
              />
            </div>
          </div>
        )}
        {data.config.characterLocks && data.config.characterLocks.length > 0 && (
          <p className="text-muted-foreground">
            {data.config.characterLocks.length} character lock
            {data.config.characterLocks.length === 1 ? '' : 's'}
          </p>
        )}
        {data.output?.videoUrl && (
          <p className="text-emerald-600 dark:text-emerald-400">Video ready</p>
        )}
        {data.cost != null && <p className="text-muted-foreground">${data.cost.toFixed(4)}</p>}
        {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
      </div>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-fuchsia-500" />
    </div>
  );
});
ContentVideoNode.displayName = 'ContentVideoNode';
