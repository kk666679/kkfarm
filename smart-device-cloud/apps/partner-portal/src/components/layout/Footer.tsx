import React from 'react';

/**
 * Footer Component
 *
 * Displays:
 * - Copyright information
 * - Links to docs, privacy, terms
 * - Build version/status
 * - Optional feedback link
 */

export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <footer className="footer" data-testid="footer">
      <div className="foot-content">
        <div className="foot-left">
          <p className="foot-copyright">
            © {currentYear} Smart Device Cloud. All rights reserved.
          </p>
          <div className="foot-links">
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
            <span className="divider">•</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            <span className="divider">•</span>
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
            <span className="divider">•</span>
            <a href="mailto:support@smartcloud.dev">Contact Support</a>
          </div>
        </div>

        <div className="foot-right">
          <span className="foot-version">v{version}</span>
          <button
            className="foot-feedback"
            onClick={() => {
              // TODO: Open feedback modal
              console.log('Feedback clicked');
            }}
            aria-label="Send feedback"
          >
            Feedback
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .footer {
          border-top: 1px solid var(--border);
          padding: clamp(16px, 2vw, 20px) clamp(18px, 3vw, 28px);
          margin-top: auto;
          position: relative;
          z-index: 2;
          background: var(--bg);
          flex-shrink: 0;
        }

        .foot-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }

        .foot-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1 1 auto;
          min-width: 0;
        }

        .foot-copyright {
          font-size: clamp(0.74rem, 1.9vw, 0.82rem);
          color: var(--dim);
          margin: 0;
          line-height: 1.4;
        }

        .foot-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: clamp(0.72rem, 1.8vw, 0.78rem);
        }

        .foot-links a {
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .foot-links a:hover {
          color: var(--cyan);
        }

        .divider {
          color: var(--border-2);
        }

        .foot-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .foot-version {
          font-size: 0.7rem;
          color: var(--dim);
          font-family: ui-monospace, monospace;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .foot-feedback {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--muted);
          font-size: 0.78rem;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
          cursor: pointer;
        }

        .foot-feedback:hover {
          border-color: var(--border-2);
          background: var(--surface-2);
          color: var(--text);
        }

        .foot-feedback:active {
          transform: scale(0.97);
        }

        @media (max-width: 600px) {
          .foot-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .foot-right {
            width: 100%;
            justify-content: space-between;
          }

          .foot-links {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
