import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StarterPrompt {
  title: string;
  description?: string;
  prompt: string;
}

interface AIPromptSuggestionsProps {
  prompts: StarterPrompt[];
  onSelect: (prompt: string) => void;
  className?: string;
}

export function AIPromptSuggestions({
  prompts,
  onSelect,
  className,
}: AIPromptSuggestionsProps) {
  if (prompts.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Try asking
      </div>
      <ul role="list" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {prompts.map(p => (
          <li key={p.title}>
            <button
              type="button"
              onClick={() => onSelect(p.prompt)}
              className="h-full w-full rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="text-sm font-medium text-foreground">{p.title}</div>
              {p.description && (
                <div className="mt-0.5 text-xs text-muted-foreground">{p.description}</div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
