'use client';
import { memo } from 'react';
import type { Node, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { StickyNote } from 'lucide-react';

export type NoteNodeData = {
  label: string;
  text?: string;
};

export type NoteNodeType = Node<NoteNodeData, 'note'>;

export const NoteNode = memo(({ data, selected }: NodeProps<NoteNodeType>) => (
  <div
    className={cn(
      'min-w-[180px] max-w-[240px] rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 shadow-sm',
      selected && 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background'
    )}
  >
    <div className="mb-1 flex items-center gap-1.5">
      <StickyNote className="h-3 w-3 text-yellow-600" />
      <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
        {data.label}
      </span>
    </div>
    {data.text && <p className="text-[11px] text-muted-foreground">{data.text}</p>}
  </div>
));
NoteNode.displayName = 'NoteNode';
