import { cn } from '@/lib/utils';

interface AILoadingDotsProps {
  label?: string;
  className?: string;
}

export function AILoadingDots({ label = 'Thinking', className }: AILoadingDotsProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
      </span>
      {label}
    </span>
  );
}
