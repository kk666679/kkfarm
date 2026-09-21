/**
 * PageHeader — Title, description, breadcrumbs, and action buttons.
 */

import { ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: ReactNode;
}

type ActionsProp = ReactNode | Action[];

function isActionArray(actions: ActionsProp): actions is Action[] {
  return (
    Array.isArray(actions) &&
    actions.every(
      (a): a is Action =>
        typeof a === 'object' && a !== null && 'label' in a && 'onClick' in a
    )
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ActionsProp;
}) {
  const actionElements: ReactNode = actions
    ? isActionArray(actions)
      ? actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              action.variant === 'danger'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : action.variant === 'secondary'
                  ? 'bg-muted text-foreground hover:bg-muted/80'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))
      : actions
    : null;

  return (
    <div className="mb-8">
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground"
        >
          <Link
            to="/"
            className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Home"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
        {actionElements && <div className="flex gap-3">{actionElements}</div>}
      </div>
    </div>
  );
}