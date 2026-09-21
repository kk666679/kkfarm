import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface RelativeTimeProps {
  /** ISO timestamp or Date. */
  value: string | Date | null | undefined;
  className?: string;
  /** Absolute-formatter for the title attribute. */
  titleFormatter?: (date: Date) => string;
  /** Fallback when value is null/undefined/invalid. */
  fallback?: string;
  /** Append suffix ("3m ago"). Default true. */
  addSuffix?: boolean;
}

function defaultTitle(date: Date): string {
  return date.toLocaleString();
}

export function RelativeTime({
  value,
  className,
  titleFormatter = defaultTitle,
  fallback = '—',
  addSuffix = true,
}: RelativeTimeProps) {
  if (value === null || value === undefined || value === '') {
    return <span className={className}>{fallback}</span>;
  }

  let date: Date;
  try {
    date = typeof value === 'string' ? parseISO(value) : value;
    if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  } catch {
    return <span className={className}>{fallback}</span>;
  }

  const text = formatDistanceToNowStrict(date, { addSuffix });

  return (
    <time
      dateTime={date.toISOString()}
      title={titleFormatter(date)}
      className={cn('tabular-nums', className)}
    >
      {text}
    </time>
  );
}
