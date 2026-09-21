import React, { useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

/**
 * Unified AppShell for Smart Device Cloud.
 *
 * Provides:
 * - Responsive sidebar with collapsible state
 * - Sticky topbar with breadcrumb + search
 * - Main content area with proper spacing
 * - Footer with theme/user controls
 *
 * Design tokens and styling pulled from partner-portal index.html
 * and unified for both dashboard and partner-portal contexts.
 */

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="app" data-testid="app-shell">
      {/* ──────────────────────────────────────────────────────────
          Sidebar — fixed, responsive, collapsible
          ────────────────────────────────────────────────────────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        currentPath={location.pathname}
      />

      {/* ──────────────────────────────────────────────────────────
          Main Content Area
          ────────────────────────────────────────────────────────── */}
      <div className="main" data-sidebar-collapsed={sidebarCollapsed}>
        {/* Topbar */}
        <Topbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={title}
          subtitle={subtitle}
        />

        {/* Content */}
        <div className="content">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Inline styles for shell layout */}
      <style>{`
        :root[data-theme="dark"] {
          --bg: #05060a;
          --surface: #0a0c13;
          --surface-2: #10131c;
          --surface-3: #161a25;
          --border: rgba(255, 255, 255, 0.07);
          --border-2: rgba(255, 255, 255, 0.12);
          --text: #e9edf6;
          --muted: #8a93a8;
          --dim: #5d6579;
          --cyan: #00e5c0;
          --violet: #7c5cff;
          --pink: #ff4d9d;
          --grad: linear-gradient(120deg, #00e5c0 0%, #5cc8ff 45%, #7c5cff 100%);
          --shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.85);
          --glow: 0 0 24px -6px rgba(0, 229, 192, 0.4);
        }

        :root[data-theme="light"] {
          --bg: #f4f6fb;
          --surface: #ffffff;
          --surface-2: #f7f9fd;
          --surface-3: #eef1f8;
          --border: rgba(15, 18, 35, 0.08);
          --border-2: rgba(15, 18, 35, 0.14);
          --text: #0b1020;
          --muted: #5c6478;
          --dim: #8891a8;
          --cyan: #00a889;
          --violet: #6b4dff;
          --pink: #db2f7d;
          --grad: linear-gradient(120deg, #00a889 0%, #2b8fe0 45%, #6b4dff 100%);
          --shadow: 0 18px 40px -22px rgba(15, 18, 35, 0.28);
          --glow: 0 0 24px -8px rgba(0, 168, 137, 0.35);
        }

        .app {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg);
          color: var(--text);
        }

        .main {
          flex: 1;
          margin-left: var(--sb-w, 264px);
          min-width: 0;
          transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .main[data-sidebar-collapsed="true"] {
          margin-left: 76px;
        }

        .content {
          flex: 1;
          padding: clamp(18px, 3vw, 28px);
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.5vw, 22px);
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .main {
            margin-left: 0;
          }
          .main[data-sidebar-collapsed="false"] {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default AppShell;
