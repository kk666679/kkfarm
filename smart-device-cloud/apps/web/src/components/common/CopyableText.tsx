import { cn } from '@/lib/utils';
import { CopyButton } from './CopyButton';

interface CopyableTextProps {
  value: string;
  /** Optional display override — the copyable value stays `value`. */
  display?: string;
  mono?: boolean;
  truncate?: boolean;
  className?: string;
  /** Show the copy button inline on hover / focus. Default true. */
  showCopy?: boolean;
}

export function CopyableText({
  value,
  display,
  mono = true,
  truncate = true,
  className,
  showCopy = true,
}: CopyableTextProps) {
  return (
    <span className={cn('group inline-flex items-center gap-1.5 max-w-full', className)}>
      <span
        className={cn(
          'min-w-0',
          mono && 'font-mono text-xs',
          truncate && 'truncate'
        )}
        title={value}
      >
        {display ?? value}
      </span>
      {showCopy && (
        <CopyButton
          value={value}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        />
      )}
    </span>
  );
}
