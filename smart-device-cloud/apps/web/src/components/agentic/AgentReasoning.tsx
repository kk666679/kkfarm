import { useState } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function fmtDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

interface AgentReasoningProps {
  /** Short summary visible in the collapsed header. */
  summary?: string;
  /** Reasoning body — operational reasoning, not chain-of-thought. */
  reasoning: string;
  defaultOpen?: boolean;
  durationMs?: number;
  className?: string;
}

/**
 * AgentReasoning
 *
 * Collapsible operational-reasoning summary. Per the architecture spec,
 * hidden chain-of-thought is never exposed. This component renders the
 * reasoning the backend chooses to emit — decisions, tool-selection
 * rationale, error analysis.
 */
export function AgentReasoning({
  summary = 'Reasoning',
  reasoning,
  defaultOpen = false,
  durationMs,
  className,
}: AgentReasoningProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('rounded-md border border-border bg-muted/30 text-xs', className)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Brain className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium">{summary}</span>
          {durationMs !== undefined && (
            <span className="tabular-nums text-muted-foreground/70">
              · {fmtDuration(durationMs)}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="border-t border-border px-2.5 py-2 text-muted-foreground">
          <p className="whitespace-pre-wrap">{reasoning}</p>
        </div>
      )}
    </div>
  );
}
