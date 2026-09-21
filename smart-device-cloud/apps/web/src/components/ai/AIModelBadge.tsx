import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIModelBadgeProps {
  model: string;
  className?: string;
  compact?: boolean;
}

export function AIModelBadge({ model, className, compact = false }: AIModelBadgeProps) {
  if (compact) {
    return (
      <span
        title={model}
        className={cn('inline-flex items-center text-muted-foreground', className)}
        aria-label={`Model: ${model}`}
      >
        <Cpu className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground',
        className
      )}
      title={`Model: ${model}`}
    >
      <Cpu className="h-3 w-3" aria-hidden="true" />
      {model}
    </span>
  );
}
