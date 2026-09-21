import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OperationsCopilot, type CopilotTurn } from '@/components/ai';

interface CopilotDockProps {
  turns: CopilotTurn[];
  suggestions?: string[];
  onSend: (input: string) => void | Promise<void>;
  /** If true, dock can be collapsed to a launcher. Default true. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * CopilotDock — right-rail wrapper around OperationsCopilot.
 *
 * Placement is the parent's responsibility. On the dashboard, place it in
 * the grid where the fourth column would be. On mobile, consider rendering
 * it inside a Sheet instead (see components/ui/sheet).
 */
export function CopilotDock({
  turns,
  suggestions,
  onSend,
  collapsible = true,
  defaultOpen = true,
  className,
}: CopilotDockProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!open && collapsible) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
      >
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        Open copilot
      </button>
    );
  }

  return (
    <OperationsCopilot
      turns={turns}
      suggestions={suggestions}
      onSend={onSend}
      onClose={collapsible ? () => setOpen(false) : undefined}
      className={cn('h-full min-h-[420px]', className)}
    />
  );
}
