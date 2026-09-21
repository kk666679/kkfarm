import { cn } from '@/lib/utils';

interface AISuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AISuggestionChips({
  suggestions,
  onSelect,
  disabled,
  className,
}: AISuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {suggestions.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          disabled={disabled}
          className={cn(
            'rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition',
            'hover:border-foreground hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
