import { useState } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentThinkingProps {
  summary?: string;
  reasoning: string;
  defaultOpen?: boolean;
  durationMs?: number;
  className?: string;
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AgentThinking({
  summary = 'Reasoning',
  reasoning,
  defaultOpen = false,
  durationMs,
  className,
}: AgentThinkingProps) {
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
