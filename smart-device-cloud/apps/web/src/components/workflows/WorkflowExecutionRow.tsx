'use client';
import {
  Clock,
  Eye,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ExecutionStatus =
  'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionRowData {
  id: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number | null;
  triggeredBy?: { id: string; name: string } | null;
  errorMessage?: string | null;
  cost?: number | null;
  tokensUsed?: number | null;
}

export interface WorkflowExecutionRowProps {
  execution: ExecutionRowData;
  onView: () => void;
  onRerun: () => void;
}

export function WorkflowExecutionRow({ execution, onView, onRerun }: WorkflowExecutionRowProps) {
  const StatusIcon = {
    completed: CheckCircle2,
    failed: XCircle,
    cancelled: AlertCircle,
    running: Loader2,
    paused: AlertCircle,
    queued: Clock,
  }[execution.status];

  const statusVariantMap = {
    completed: 'secondary',
    failed: 'destructive',
    cancelled: 'outline',
    running: 'default',
    paused: 'outline',
    queued: 'outline',
  } as const satisfies Record<
    ExecutionStatus,
    'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  >;

  const statusVariant = statusVariantMap[execution.status];

  const isLive = execution.status === 'running';

  return (
    <Card
      className={cn(
        'flex items-center justify-between gap-4 border-border bg-card p-4',
        isLive && 'border-primary/50'
      )}
    >
      <button
        type="button"
        onClick={onView}
        aria-label={`View execution ${execution.id.slice(0, 8)}`}
        className="flex flex-1 items-center gap-4 text-left"
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            isLive ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          <StatusIcon
            className={cn(
              'h-5 w-5',
              execution.status === 'failed' && 'text-destructive',
              execution.status === 'completed' && 'text-emerald-500',
              isLive && 'animate-spin text-primary',
              (execution.status === 'cancelled' || execution.status === 'paused') &&
                'text-muted-foreground'
            )}
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Execution {execution.id.slice(0, 8)}</span>
            <Badge variant={statusVariant} className="capitalize text-xs">
              {execution.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {relativeTime(execution.startedAt)}
            </span>
            {execution.durationMs != null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(execution.durationMs)}
              </span>
            )}
            {execution.triggeredBy && <span>by {execution.triggeredBy.name}</span>}
            {execution.cost != null && <span>${execution.cost.toFixed(4)}</span>}
            {execution.tokensUsed != null && (
              <span>{execution.tokensUsed.toLocaleString()} tokens</span>
            )}
          </div>

          {execution.errorMessage && (
            <p className="line-clamp-1 text-xs text-destructive">{execution.errorMessage}</p>
          )}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onView} aria-label="View execution">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onRerun} aria-label="Rerun workflow">
          <RotateCcw className="h-4 w-4" />
        </Button>
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
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}
