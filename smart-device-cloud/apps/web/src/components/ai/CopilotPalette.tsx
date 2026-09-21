import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OperationsCopilot, type CopilotTurn } from './OperationsCopilot';

interface CopilotPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turns: CopilotTurn[];
  suggestions?: string[];
  onSend: (input: string) => void | Promise<void>;
  className?: string;
}

export function CopilotPalette({
  open,
  onOpenChange,
  turns,
  suggestions,
  onSend,
  className,
}: CopilotPaletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="AI copilot"
      ref={containerRef}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl',
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-sm font-semibold text-foreground">AI copilot</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close copilot"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <OperationsCopilot
          turns={turns}
          suggestions={suggestions}
          onSend={onSend}
          bare
          className="max-h-[70vh] border-0"
        />
      </div>
    </div>
  );
}
