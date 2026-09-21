'use client';
import { memo } from 'react';
import type { Node, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

export type GroupNodeData = {
  label: string;
  collapsed?: boolean;
};

export type GroupNodeType = Node<GroupNodeData, 'group'>;

export const GroupNode = memo(({ data, selected }: NodeProps<GroupNodeType>) => (
  <div
    className={cn(
      'h-full w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/5',
      selected && 'border-primary/50'
    )}
  >
    <div className="rounded-t-lg border-b border-dashed border-muted-foreground/30 bg-muted/20 px-3 py-1.5">
      <p className="text-xs font-semibold text-muted-foreground">{data.label}</p>
    </div>
  </div>
));
GroupNode.displayName = 'GroupNode';
