/**
 * Breadcrumbs — Navigation trail.
 *
 * Sibling of PageHeader. PageHeader currently inlines its own breadcrumb
 * markup with a different API (optional href on the final crumb). Both are
 * kept for now; consolidating them is a Phase 20 design-system task.
 *
 * Accessibility:
 *   - <nav aria-label="Breadcrumb"> landmark.
 *   - <ol>/<li> semantics.
 *   - aria-current="page" on the terminal crumb.
 *   - Decorative icons aria-hidden; the Home link has an accessible name.
 */

import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            aria-label="Home"
            className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.href} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
              {isLast ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
