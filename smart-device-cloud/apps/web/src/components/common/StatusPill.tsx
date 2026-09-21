import { cn } from '@/lib/utils';

export type StatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent';

const TONES: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  danger: 'bg-destructive/10 text-destructive',
  accent: 'bg-primary/10 text-primary',
};

interface StatusPillProps {
  tone?: StatusTone;
  children: React.ReactNode;
  /** Optional leading dot. */
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusPill({
  tone = 'neutral',
  children,
  dot = false,
  size = 'sm',
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        TONES[tone],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            tone === 'success' && 'bg-emerald-500',
            tone === 'warning' && 'bg-amber-500',
            tone === 'danger' && 'bg-destructive',
            tone === 'info' && 'bg-blue-500',
            tone === 'accent' && 'bg-primary',
            tone === 'neutral' && 'bg-muted-foreground'
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
