import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentRunStatusBadge } from './AgentRunStatusBadge';
import type { AgentRunSummary } from './types';

function fmtDuration(startIso: string, endIso?: string): string {
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const ms = end - new Date(startIso).getTime();
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

interface AgentRunRowProps {
  run: AgentRunSummary;
  href?: string;
  className?: string;
}

export function AgentRunRow({ run, href, className }: AgentRunRowProps) {
  const isRunning = run.status === 'running';
  const target = href ?? `/agents/runs/${run.id}`;

  return (
    <li className={cn('flex items-center gap-3 px-3 py-2.5', className)}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Cpu className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            to={target}
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {run.agentName}
          </Link>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {run.id.slice(0, 8)}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {run.deviceCount !== undefined
              ? `${run.deviceCount} device${run.deviceCount === 1 ? '' : 's'}`
              : '—'}
          </span>
          <span className="tabular-nums">
            {fmtDuration(run.startedAt, isRunning ? undefined : run.finishedAt)}
            {isRunning && ' (running)'}
          </span>
          {run.cost && (
            <span className="tabular-nums">
              ${run.cost.usd.toFixed(3)} · {run.cost.tokens.toLocaleString()} tok
            </span>
          )}
        </div>
      </div>

      <AgentRunStatusBadge status={run.status} />
    </li>
  );
}
