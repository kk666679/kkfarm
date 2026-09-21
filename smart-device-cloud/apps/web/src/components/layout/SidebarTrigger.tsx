import { Menu, X } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar.store';
import { cn } from '@/lib/utils';

/**
 * Off-canvas sidebar trigger. Rendered by Layout on <480px only.
 * Fixed above the Header; Layout owns positioning context.
 */
export function SidebarTrigger({ className }: { className?: string }) {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      aria-expanded={isOpen}
      aria-controls="sidebar-navigation"
      className={cn(
        'fixed left-3 top-3 z-50 rounded-lg border border-border bg-card p-2 shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
    >
      {isOpen ? (
        <X className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Menu className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}