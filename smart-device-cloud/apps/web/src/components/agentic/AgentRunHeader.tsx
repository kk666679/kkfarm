import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentRunStatusBadge } from './AgentRunStatusBadge';
import type { AgentRunSummary } from './types';

function fmtAbsolute(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

interface AgentRunHeaderProps {
  run: AgentRunSummary;
  /** Optional right-aligned actions (Pause, Abort, Take over…). */
  actions?: React.ReactNode;
  className?: string;
}

export function AgentRunHeader({ run, actions, className }: AgentRunHeaderProps) {
  const elapsedMs =
    (run.finishedAt ? new Date(run.finishedAt).getTime() : Date.now()) -
    new Date(run.startedAt).getTime();
  const elapsedS = Math.floor(elapsedMs / 1000);

  return (
    <div className={cn('flex flex-wrap items-center gap-4 border-b border-border pb-4', className)}>
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Cpu className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">{run.agentName}</h1>
          <AgentRunStatusBadge status={run.status} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{run.id}</span>
          <span>Started {fmtAbsolute(run.startedAt)}</span>
          <span className="tabular-nums">
            {elapsedS}s{!run.finishedAt && ' · in progress'}
          </span>
          {run.deviceCount !== undefined && (
            <span>
              {run.deviceCount} device{run.deviceCount === 1 ? '' : 's'}
            </span>
          )}
          {run.workflowId && <span>workflow {run.workflowId.slice(0, 8)}</span>}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
