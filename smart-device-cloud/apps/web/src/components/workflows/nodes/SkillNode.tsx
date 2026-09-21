'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { BookOpen } from 'lucide-react';

export type SkillNodeData = {
  label: string;
  config: {
    skillName?: string;
    version?: string;
    input?: Record<string, unknown>;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  error?: string;
};

export type SkillNodeType = Node<SkillNodeData, 'skill'>;

export const SkillNode = memo(({ data, selected }: NodeProps<SkillNodeType>) => (
  <div
    className={cn(
      'min-w-[220px] overflow-hidden rounded-lg border border-amber-500/30 bg-card shadow-sm',
      selected && 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background',
      data.status === 'error' && 'border-destructive/50'
    )}
  >
    <NodeHeader
      icon={<BookOpen className="h-3 w-3 text-amber-500" />}
      title={data.label}
      subtitle={
        data.config.skillName
          ? `${data.config.skillName}@${data.config.version ?? 'latest'}`
          : undefined
      }
      status={data.status}
    />
    <div className="space-y-1 px-3 py-2 text-[11px] text-muted-foreground">
      {data.error ? (
        <p className="line-clamp-2 text-destructive">{data.error}</p>
      ) : (
        <p>Skill invocation</p>
      )}
    </div>
    <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-muted-foreground" />
    <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-amber-500" />
  </div>
));
SkillNode.displayName = 'SkillNode';
