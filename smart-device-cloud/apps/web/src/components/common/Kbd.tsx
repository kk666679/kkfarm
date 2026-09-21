import { cn } from '@/lib/utils';

interface KbdProps {
  /** Key or key combination. Use `+` to separate, e.g. "Cmd+K". */
  children: string;
  className?: string;
  size?: 'sm' | 'md';
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Render a keyboard shortcut. Substitutes ⌘/⌥/⇧ for Cmd/Alt/Shift on macOS. */
export function Kbd({ children, className, size = 'sm' }: KbdProps) {
  const display = isMac
    ? children
        .replace(/Cmd/gi, '⌘')
        .replace(/Ctrl/gi, '⌃')
        .replace(/Alt/gi, '⌥')
        .replace(/Shift/gi, '⇧')
    : children;

  return (
    <kbd
      className={cn(
        'inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-muted-foreground',
        size === 'sm' ? 'text-[10px] leading-none' : 'text-xs',
        className
      )}
    >
      {display}
    </kbd>
  );
}
