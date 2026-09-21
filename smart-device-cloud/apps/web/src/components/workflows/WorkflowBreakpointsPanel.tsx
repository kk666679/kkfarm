'use client';
import { Circle } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/workflows';
import { cn } from '@/lib/utils';

export interface WorkflowBreakpointsPanelProps {
  nodes: Node[];
  breakpoints: string[];
  selectedNodeId: string | null;
  currentNodeId: string | null;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function WorkflowBreakpointsPanel({
  nodes,
  breakpoints,
  selectedNodeId,
  currentNodeId,
  onToggle,
  disabled = false,
}: WorkflowBreakpointsPanelProps) {
  if (nodes.length === 0) {
    return <EmptyState title="No nodes" description="Add nodes to set breakpoints." />;
  }

  return (
    <Card className="border-border bg-card p-3">
      <p className="mb-3 text-xs text-muted-foreground">
        {disabled
          ? 'Breakpoints are locked while debugging.'
          : 'Click a node to toggle a breakpoint.'}
      </p>
      <div className="space-y-1">
        {nodes.map(node => {
          const isBreakpoint = breakpoints.includes(node.id);
          const isCurrent = node.id === currentNodeId;
          const isSelected = node.id === selectedNodeId;
          return (
            <button
              key={node.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(node.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                isSelected && 'bg-accent',
                isCurrent && 'ring-1 ring-primary',
                !disabled && 'hover:bg-accent/50'
              )}
            >
              <Circle
                className={cn(
                  'h-3 w-3 shrink-0',
                  isBreakpoint ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                )}
              />
              <span className="truncate">{(node.data.label as string) ?? node.id}</span>
              {isCurrent && (
                <Badge variant="default" className="ml-auto text-[10px]">
                  current
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
