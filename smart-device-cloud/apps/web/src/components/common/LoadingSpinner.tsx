import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: Size;
  className?: string;
  /** Accessible label. Set to null to render as decorative. */
  label?: string | null;
}

const SIZE: Record<Size, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Loading',
}: LoadingSpinnerProps) {
  const spinner = (
    <Loader2
      className={cn('animate-spin text-muted-foreground', SIZE[size], className)}
      aria-hidden={label ? undefined : true}
    />
  );

  if (!label) return spinner;

  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      {spinner}
      <span className="sr-only">{label}</span>
    </span>
  );
}
