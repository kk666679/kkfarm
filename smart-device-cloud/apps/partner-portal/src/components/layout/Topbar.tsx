import React, { useState } from 'react';

interface TopbarProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * Sticky Topbar with:
 * - Mobile sidebar toggle
 * - Breadcrumb/title + subtitle
 * - Search input
 * - Action buttons (notifications, etc.)
 */

export function Topbar({ onToggleSidebar, title, subtitle }: TopbarProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="topbar" data-testid="topbar">
      {/* Mobile toggle */}
      <button
        className="tb-mobile-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Title + Subtitle */}
      <div className="tb-title-wrap">
        {title && <div className="tb-title">{title}</div>}
        {subtitle && <div className="tb-sub">{subtitle}</div>}
      </div>

      {/* Search */}
      <div className="tb-search">
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          data-testid="topbar-search"
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
      </div>

      {/* Actions */}
      <div className="tb-actions">
        <button className="tb-icon" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
          </svg>
          <div className="dot"></div>
        </button>
        <button className="tb-icon" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="1" />
            <path d="M12 1v6m0 6v6" />
            <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24" />
            <path d="M1 12h6m6 0h6" />
            <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
          </svg>
        </button>
      </div>

      {/* Styles */}
      <style>{`
        .topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 clamp(16px, 3vw, 28px);
          background: var(--bg);
          background: color-mix(in srgb, var(--bg) 78%, transparent);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .tb-mobile-toggle {
          display: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid var(--border-2);
          background: var(--surface);
          cursor: pointer;
          transition: background 0.2s;
        }

        .tb-mobile-toggle:hover {
          background: var(--surface-2);
        }

        .tb-mobile-toggle svg {
          width: 16px;
          height: 16px;
          stroke: var(--text);
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
        }

        .tb-title-wrap {
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-right: auto;
        }

        .tb-title {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 600;
          font-size: 1.02rem;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        .tb-sub {
          font-size: 0.76rem;
          color: var(--dim);
          white-space: nowrap;
        }

        .tb-search {
          position: relative;
          width: clamp(160px, 26vw, 320px);
          flex-shrink: 1;
        }

        .tb-search input {
          width: 100%;
          padding: 9px 12px 9px 34px;
          border-radius: 10px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 0.84rem;
          transition: border-color 0.2s, background 0.2s;
          min-height: 40px;
        }

        .tb-search input::placeholder {
          color: var(--dim);
        }

        .tb-search input:focus {
          outline: none;
          border-color: var(--border-2);
          background: var(--surface-3);
        }

        .tb-search svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          stroke: var(--dim);
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          pointer-events: none;
        }

        .tb-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .tb-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          position: relative;
          border: 1px solid var(--border);
          background: var(--surface);
          transition: background 0.2s, border-color 0.2s;
          cursor: pointer;
        }

        .tb-icon:hover {
          background: var(--surface-2);
          border-color: var(--border-2);
        }

        .tb-icon svg {
          width: 16px;
          height: 16px;
          stroke: var(--muted);
          fill: none;
          stroke-width: 1.9;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .tb-icon .dot {
          position: absolute;
          top: 9px;
          right: 9px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--pink);
          box-shadow: 0 0 0 2px var(--surface);
        }

        @media (max-width: 900px) {
          .tb-mobile-toggle {
            display: grid;
          }
        }

        @media (max-width: 600px) {
          .tb-search {
            display: none;
          }

          .tb-title {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </header>
  );
}

export default Topbar;
