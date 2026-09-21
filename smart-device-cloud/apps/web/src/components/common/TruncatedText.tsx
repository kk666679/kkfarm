import { cn } from '@/lib/utils';

interface TruncatedTextProps {
  children: string;
  /** Number of lines before truncating. Default 1. */
  lines?: 1 | 2 | 3 | 4;
  className?: string;
  /** Custom title (defaults to children). Set to null to omit. */
  title?: string | null;
}

const LINE_CLASS = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
} as const;

export function TruncatedText({
  children,
  lines = 1,
  className,
  title,
}: TruncatedTextProps) {
  const titleAttr = title === null ? undefined : (title ?? children);
  return (
    <span className={cn('block', LINE_CLASS[lines], className)} title={titleAttr}>
      {children}
    </span>
  );
}
