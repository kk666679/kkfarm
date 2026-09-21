import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  currentPath: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', path: '/overview', icon: '📊', section: 'Main' },
  { label: 'Tenants', path: '/tenants', icon: '🏢' },
  { label: 'Devices', path: '/devices', icon: '📱' },
  { label: 'Workloads', path: '/workloads', icon: '⚙️' },
  { label: 'Billing', path: '/billing', icon: '💳', section: 'Management' },
  { label: 'Analytics', path: '/analytics', icon: '📈' },
  { label: 'Integrations', path: '/integrations', icon: '🔗' },
  { label: 'MCP', path: '/mcp', icon: '🤖', section: 'Advanced' },
  { label: 'Audit', path: '/audit', icon: '📋' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
  // Partner Portal routes
  { label: 'API Keys', path: '/api-keys', icon: '🔑', section: 'Partner Portal' },
  { label: 'Usage', path: '/usage', icon: '📊' },
  { label: 'Webhooks', path: '/webhooks', icon: '🔔' },
  { label: 'Documentation', path: '/docs', icon: '📚' },
  { label: 'API Explorer', path: '/api-explorer', icon: '🔍' },
];

/**
 * Sidebar Navigation Component
 *
 * Features:
 * - Collapsible with smooth animation
 * - Active route highlighting with accent bar
 * - Tooltip on hover when collapsed
 * - Theme switcher in footer
 * - User card with presence indicator
 * - Section grouping support
 */

export function Sidebar({ collapsed, onCollapse, currentPath }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const isActive = (path: string) => {
    return currentPath.startsWith(path);
  };

  const handleNavItemHover = (e: React.MouseEvent, itemPath: string) => {
    if (collapsed) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
      setHoveredItem(itemPath);
    }
  };

  // Group items by section
  const sections: { [key: string]: NavItem[] } = {};
  NAV_ITEMS.forEach((item) => {
    const section = item.section || 'Default';
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(item);
  });

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} data-testid="sidebar">
        {/* Header */}
        <div className="sb-head">
          <div className="sb-logo">
            <div className="sb-logo-mark">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <span className="sb-logo-text">Smart Device Cloud</span>
          </div>
          <button
            className="sb-collapse"
            onClick={() => onCollapse(!collapsed)}
            aria-label="Toggle sidebar"
            data-testid="sidebar-collapse-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sb-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              {section !== 'Default' && !collapsed && (
                <div className="sb-section-label">{section}</div>
              )}
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onMouseEnter={(e) => handleNavItemHover(e, item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  data-testid={`nav-${item.path.replace(/\//g, '-')}`}
                >
                  <span className="ni-icon">{item.icon}</span>
                  <span className="ni-label">{item.label}</span>
                  {item.badge && <span className="ni-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-foot">
          <ThemeSwitcher />
          <UserCard />
        </div>
      </aside>

      {/* Tooltip (portal-escaped) */}
      {hoveredItem && tooltipPos && collapsed && (
        <div
          className="sb-tooltip show"
          style={{
            position: 'fixed',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {NAV_ITEMS.find((item) => item.path === hoveredItem)?.label}
        </div>
      )}

      {/* Styles */}
      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sb-w, 264px);
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 60;
          transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .sidebar.collapsed {
          --sb-w: 76px;
        }

        .sb-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 16px 14px;
          height: 64px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: -0.03em;
          white-space: nowrap;
          overflow: hidden;
          min-width: 0;
        }

        .sb-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: var(--grad);
          display: grid;
          place-items: center;
          flex-shrink: 0;
          box-shadow: var(--glow);
        }

        .sb-logo-mark svg {
          width: 16px;
          height: 16px;
          color: white;
        }

        .sb-logo-text {
          opacity: 1;
          transition: opacity 0.2s, width 0.28s;
          overflow: hidden;
        }

        .sidebar.collapsed .sb-logo-text {
          opacity: 0;
          width: 0;
        }

        .sb-collapse {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid var(--border-2);
          background: var(--surface-2);
          transition: background 0.2s, border-color 0.2s;
          cursor: pointer;
        }

        .sb-collapse:hover {
          background: var(--surface-3);
        }

        .sb-collapse svg {
          width: 14px;
          height: 14px;
          stroke: var(--muted);
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: transform 0.3s;
        }

        .sidebar.collapsed .sb-collapse svg {
          transform: rotate(180deg);
        }

        .sb-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 14px 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          scrollbar-width: thin;
        }

        .sb-section-label {
          font-size: 0.66rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--dim);
          font-weight: 600;
          padding: 14px 12px 6px;
          white-space: nowrap;
          transition: opacity 0.2s;
        }

        .sidebar.collapsed .sb-section-label {
          opacity: 0;
          height: 0;
          padding: 0;
          overflow: hidden;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--muted);
          font-weight: 500;
          font-size: 0.88rem;
          white-space: nowrap;
          overflow: hidden;
          transition: background 0.18s, color 0.18s;
          min-height: 42px;
          width: 100%;
          text-align: left;
          text-decoration: none;
        }

        .nav-item:hover {
          background: var(--surface-2);
          color: var(--text);
        }

        .nav-item.active {
          background: var(--surface-3);
          color: var(--text);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 9px;
          bottom: 9px;
          width: 3px;
          background: var(--grad);
          border-radius: 0 3px 3px 0;
        }

        .ni-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          font-size: 1.1em;
        }

        .ni-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: opacity 0.2s;
        }

        .sidebar.collapsed .ni-label {
          opacity: 0;
        }

        .ni-badge {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 100px;
          background: rgba(0, 229, 192, 0.13);
          color: var(--cyan);
          flex-shrink: 0;
          transition: opacity 0.2s;
        }

        .sidebar.collapsed .ni-badge {
          opacity: 0;
          width: 0;
          padding: 0;
          overflow: hidden;
        }

        .sb-foot {
          border-top: 1px solid var(--border);
          padding: 10px 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
          background: var(--surface);
        }

        .sb-tooltip {
          position: fixed;
          z-index: 150;
          background: var(--surface-3);
          color: var(--text);
          font-size: 0.78rem;
          font-weight: 500;
          padding: 6px 11px;
          border-radius: 8px;
          border: 1px solid var(--border-2);
          box-shadow: var(--shadow);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateY(-50%) translateX(-4px) scale(0.96);
          transition: opacity 0.15s, transform 0.15s;
        }

        .sb-tooltip.show {
          opacity: 1;
          transform: translateY(-50%) translateX(0) scale(1);
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 264px;
          }
        }
      `}</style>
    </>
  );
}

function ThemeSwitcher() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      return (stored as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const html = document.documentElement;
    html.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="theme-seg">
      <button
        className={`ts-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={toggleTheme}
        aria-label="Dark theme"
      >
        🌙
      </button>
      <button
        className={`ts-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={toggleTheme}
        aria-label="Light theme"
      >
        ☀️
      </button>
    </div>
  );
}

function UserCard() {
  return (
    <div className="user-card">
      <div className="user-avatar">U</div>
      <div className="user-meta">
        <div className="u-name">User</div>
        <div className="u-mail">user@example.com</div>
      </div>
    </div>
  );
}

export default Sidebar;
