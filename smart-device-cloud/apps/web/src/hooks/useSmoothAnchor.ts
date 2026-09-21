import { useEffect } from 'react';

interface Options {
  /** Pixels to leave above the target for a sticky header. Default: 0. */
  offset?: number;
  /** Only handle anchors whose href starts with this. Default: '#'. */
  prefix?: string;
}

/**
 * Delegates click events on in-page anchor links and scrolls the
 * matching element into view, respecting a sticky-header offset.
 *
 * Handles:
 *  - Invalid CSS selectors in the id (safe via try/catch + CSS.escape)
 *  - Empty fragments (`href="#"`) — ignored
 *  - External links that happen to start with `#` — ignored
 *  - Non-left-click / modified clicks — ignored
 *  - Missing targets — falls back to native behaviour
 */
export function useSmoothAnchors({
  offset = 0,
  prefix = '#',
}: Options = {}): void {
  useEffect(() => {
    // Respect the user's reduced-motion preference.
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';

    const handler = (event: MouseEvent) => {
      // Only handle plain left-clicks without modifier keys.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest(
        `a[href^="${prefix}"]`
      ) as HTMLAnchorElement | null;

      if (!anchor) return;

      // Ignore external or malformed links.
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href') ?? '';
      const rawId = href.slice(prefix.length);

      // Plain `#` or `#!` etc. — let the browser handle it.
      if (!rawId || rawId === '!') return;

      // Decode URI-encoded ids (e.g. `#my%20section`).
      let id: string;
      try {
        id = decodeURIComponent(rawId);
      } catch {
        id = rawId;
      }

      // Guard against invalid selectors.
      let target: Element | null = null;
      try {
        target = document.querySelector(`#${CSS.escape(id)}`);
      } catch {
        target = document.getElementById(id);
      }

      if (!target) return;

      event.preventDefault();

      const top =
        target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior });

      // Update the URL without an extra jump.
      if (history.replaceState) {
        history.replaceState(null, '', `${prefix}${id}`);
      }

      // Move focus for screen readers / keyboard users.
      if (target instanceof HTMLElement) {
        const hadTabIndex = target.hasAttribute('tabindex');
        if (!hadTabIndex) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (!hadTabIndex) {
          target.addEventListener(
            'blur',
            () => target.removeAttribute('tabindex'),
            { once: true }
          );
        }
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [offset, prefix]);
}