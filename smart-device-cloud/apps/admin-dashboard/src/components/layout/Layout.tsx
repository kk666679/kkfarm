import { type ReactNode } from 'react';
import { AppShell } from './AppShell';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Layout wrapper that uses the unified AppShell.
 * Provides the sidebar + topbar + footer structure for all pages.
 */
export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      {children}
    </AppShell>
  );
}
