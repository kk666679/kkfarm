'use client';
import {
  Play,
  Pencil,
  Copy,
  Trash2,
  History,
  MoreHorizontal,
  GitBranch,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WorkflowStatus } from '@smart-device-cloud/shared';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface WorkflowListCardWorkflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  triggerType?: string;
  nodeCount?: number;
  runCount?: number;
  lastRunAt?: string | null;
}

export interface WorkflowListCardProps {
  workflow: WorkflowListCardWorkflow;
  onOpen: () => void;
  onEdit: () => void;
  onRun: () => void;
  onHistory: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  running?: boolean;
}

export function WorkflowListCard({
  workflow,
  onOpen,
  onEdit,
  onRun,
  onHistory,
  onDuplicate,
  onDelete,
  running = false,
}: WorkflowListCardProps) {
  const statusVariantMap = {
    active: 'default',
    draft: 'secondary',
    archived: 'outline',
    paused: 'outline',
    disabled: 'outline',
    running: 'default',
    completed: 'secondary',
    failed: 'destructive',
    cancelled: 'outline',
  } as const satisfies Record<WorkflowStatus, 'default' | 'secondary' | 'destructive' | 'outline'>;

  const statusVariant = statusVariantMap[workflow.status];

  return (
    <Card className="group flex flex-col border-border bg-card transition-colors hover:border-primary/50">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${workflow.name}`}
        className="flex flex-1 flex-col gap-3 p-4 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">{workflow.name}</h3>
            <p className="text-xs text-muted-foreground">{workflow.triggerType ?? 'manual'}</p>
          </div>
          <Badge variant={statusVariant} className="capitalize">
            {workflow.status}
          </Badge>
        </div>

        {workflow.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{workflow.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {workflow.nodeCount ?? 0} nodes
          </span>
          {workflow.lastRunAt && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {relativeTime(workflow.lastRunAt)}
            </span>
          )}
          {workflow.runCount != null && workflow.runCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {workflow.runCount}
            </span>
          )}
        </div>
      </button>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <Button size="sm" className="flex-1" onClick={onRun} disabled={running}>
          <Play className="mr-1 h-3.5 w-3.5" />
          Run
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit} aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" aria-label="More actions">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onHistory}>
              <History className="mr-2 h-4 w-4" />
              Execution history
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
