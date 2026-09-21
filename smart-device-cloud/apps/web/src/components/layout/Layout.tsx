import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarTrigger } from './SidebarTrigger';
import { useSidebarStore } from '@/store/sidebar.store';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { navigationConfig } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

/**
 * Application shell.
 *
 * Responsive contract (single breakpoint, shared with Sidebar):
 *   < 480px  : off-canvas overlay + SidebarTrigger hamburger
 *   >= 480px : docked rail, width 64 (open) / 20 (collapsed)
 *
 * State ownership:
 *   - useSidebarStore is the single source of truth for open/closed.
 *   - Layout owns: mobile overlay, content offset, scroll lock, skip link.
 *   - Sidebar owns: the <aside> element only.
 */
export function Layout() {
  const { isOpen } = useSidebarStore();
  const isOffCanvas = useMediaQuery('(max-width: 479px)');

  useEffect(() => {
    if (isOffCanvas && isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOffCanvas, isOpen]);

  return (
    <div className="flex min-h-screen bg-background no-overflow-x">
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:absolute focus:left-2 focus:top-2 focus:z-50',
          'focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2',
          'focus:text-primary-foreground focus:outline-none',
          'focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        Skip to main content
      </a>

      <Sidebar navigation={navigationConfig} />

      {isOffCanvas && isOpen && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => useSidebarStore.getState().close()}
          aria-hidden="true"
          role="presentation"
        />
      )}

      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-out',
          'w-full',
          isOffCanvas ? 'ml-0' : isOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <Header />

        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background outline-none',
            isOffCanvas && 'safe-bottom'
          )}
        >
          <div
            className={cn(
              'container-responsive',
              isOffCanvas ? 'px-fluid-2 py-fluid-3' : 'px-fluid-3 py-fluid-4'
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {isOffCanvas && <SidebarTrigger />}
    </div>
  );
}