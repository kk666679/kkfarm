import { useState } from 'react';
import { ChevronDown, Wrench, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentToolCall, AgentToolCallStatus } from './types';

const STATUS: Record<
  AgentToolCallStatus,
  { icon: LucideIcon; className: string }
> = {
  pending: { icon: Wrench, className: 'text-muted-foreground' },
  running: { icon: Loader2, className: 'text-primary animate-spin' },
  completed: { icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  failed: { icon: XCircle, className: 'text-destructive' },
};

function fmtDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

interface AgentToolCallListProps {
  calls: AgentToolCall[];
  className?: string;
}

export function AgentToolCallList({ calls, className }: AgentToolCallListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (calls.length === 0) {
    return (
      <div className={cn('rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground', className)}>
        No tool calls yet.
      </div>
    );
  }

  return (
    <ul role="list" className={cn('space-y-1', className)}>
      {calls.map(c => {
        const cfg = STATUS[c.status];
        const Icon = cfg.icon;
        const open = expanded === c.id;
        const hasDetail =
          c.args !== undefined || c.result !== undefined || c.error !== undefined;

        return (
          <li key={c.id} className="rounded-md border border-border bg-card text-xs">
            <button
              type="button"
              onClick={() => hasDetail && setExpanded(open ? null : c.id)}
              aria-expanded={open}
              disabled={!hasDetail}
              className={cn(
                'flex w-full items-center gap-2 px-2.5 py-1.5 text-left',
                hasDetail &&
                  'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', cfg.className)} aria-hidden="true" />
              <span className="truncate font-mono text-foreground">{c.name}</span>
              {c.durationMs !== undefined && (
                <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
                  {fmtDuration(c.durationMs)}
                </span>
              )}
              {hasDetail && (
                <ChevronDown
                  className={cn(
                    'h-3 w-3 shrink-0 text-muted-foreground transition-transform',
                    open && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              )}
            </button>

            {open && hasDetail && (
              <div className="space-y-1.5 border-t border-border px-2.5 py-2">
                {c.args && Object.keys(c.args).length > 0 && (
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Arguments
                    </div>
                    <pre className="mt-0.5 overflow-x-auto rounded bg-muted/50 p-1.5 text-[10px]">
                      {JSON.stringify(c.args, null, 2)}
                    </pre>
                  </div>
                )}
                {c.error && (
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-destructive">
                      Error
                    </div>
                    <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap rounded bg-destructive/10 p-1.5 text-[10px] text-destructive">
                      {c.error}
                    </pre>
                  </div>
                )}
                {c.result !== undefined && !c.error && (
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Result
                    </div>
                    <pre className="mt-0.5 max-h-40 overflow-auto rounded bg-muted/50 p-1.5 text-[10px]">
                      {typeof c.result === 'string'
                        ? c.result
                        : JSON.stringify(c.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
