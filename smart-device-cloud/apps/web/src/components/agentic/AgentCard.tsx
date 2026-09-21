import { Cpu, Zap, DollarSign, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentIdentity } from './types';

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;
}

function fmtRelative(iso?: string): string {
  if (!iso) return 'never';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

interface AgentCardProps {
  agent: AgentIdentity;
  onOpen?: (agent: AgentIdentity) => void;
  className?: string;
}

export function AgentCard({ agent, onOpen, className }: AgentCardProps) {
  const disabled = agent.enabled === false;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(agent)}
      disabled={disabled}
      className={cn(
        'flex w-full flex-col items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-shadow hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Cpu className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {agent.name}
            </div>
            {agent.model && (
              <div className="truncate font-mono text-[10px] text-muted-foreground">
                {agent.model}
              </div>
            )}
          </div>
        </div>
        {disabled && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Disabled
          </span>
        )}
      </div>

      {agent.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {agent.description}
        </p>
      )}

      {agent.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 4).map(c => (
            <span
              key={c}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {c}
            </span>
          ))}
          {agent.capabilities.length > 4 && (
            <span className="text-[10px] text-muted-foreground">
              +{agent.capabilities.length - 4}
            </span>
          )}
        </div>
      )}

      <dl className="grid w-full grid-cols-3 gap-3 border-t border-border pt-3 text-xs">
        {agent.successRate !== undefined && (
          <div>
            <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Zap className="h-2.5 w-2.5" aria-hidden="true" />
              Success
            </dt>
            <dd className="tabular-nums font-medium text-foreground">
              {(agent.successRate * 100).toFixed(1)}%
            </dd>
          </div>
        )}
        {agent.avgDurationMs !== undefined && (
          <div>
            <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Activity className="h-2.5 w-2.5" aria-hidden="true" />
              Avg
            </dt>
            <dd className="tabular-nums font-medium text-foreground">
              {fmtDuration(agent.avgDurationMs)}
            </dd>
          </div>
        )}
        {agent.costPerRunUsd !== undefined && (
          <div>
            <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <DollarSign className="h-2.5 w-2.5" aria-hidden="true" />
              Cost
            </dt>
            <dd className="tabular-nums font-medium text-foreground">
              ${agent.costPerRunUsd.toFixed(3)}
            </dd>
          </div>
        )}
      </dl>

      <div className="text-[10px] text-muted-foreground">
        Last active {fmtRelative(agent.lastActiveAt)}
      </div>
    </button>
  );
}
