import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps {
  children: ReactNode;
  /** Render as a span (default) or div. */
  as?: 'span' | 'div';
  className?: string;
}

/**
 * Content visible to screen readers only.
 *
 * Prefer Tailwind's `sr-only` class where possible. Use this component when
 * you need a React wrapper (e.g. inside a `<Link>` that has no textual label).
 */
export function VisuallyHidden({
  children,
  as: Tag = 'span',
  className,
}: VisuallyHiddenProps) {
  return <Tag className={cn('sr-only', className)}>{children}</Tag>;
}
