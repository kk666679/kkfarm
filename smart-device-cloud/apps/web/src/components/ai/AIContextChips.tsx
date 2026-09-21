import { Layers, Smartphone, X, GitBranch, Users, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ContextKind = 'devices' | 'workflow' | 'pool' | 'agents' | 'selection';

export interface AIContextChip {
  id: string;
  kind: ContextKind;
  label: string;
  count?: number;
  onRemove?: () => void;
}

interface AIContextChipsProps {
  chips: AIContextChip[];
  hideWhenEmpty?: boolean;
  className?: string;
}

const ICON: Record<ContextKind, LucideIcon> = {
  devices: Smartphone,
  workflow: GitBranch,
  pool: Layers,
  agents: Cpu,
  selection: Users,
};

export function AIContextChips({
  chips,
  hideWhenEmpty = true,
  className,
}: AIContextChipsProps) {
  if (chips.length === 0 && hideWhenEmpty) return null;

  return (
    <div
      role="list"
      aria-label="Context attached to this conversation"
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      {chips.map(c => {
        const Icon = ICON[c.kind];
        return (
          <span
            key={c.id}
            role="listitem"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-xs text-foreground"
          >
            <Icon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <span>{c.label}</span>
            {c.count !== undefined && (
              <span className="rounded bg-muted px-1 text-[10px] tabular-nums text-muted-foreground">
                {c.count}
              </span>
            )}
            {c.onRemove && (
              <button
                type="button"
                onClick={c.onRemove}
                aria-label={`Remove ${c.label} from context`}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
