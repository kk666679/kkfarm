import { useEffect } from 'react';

interface Options {
  /** Class applied to elements to be revealed. Default: 'reveal'. */
  selector?: string;
  /** Class added once the element has entered the viewport. Default: 'in'. */
  activeClass?: string;
  /** Root margin passed to IntersectionObserver. */
  rootMargin?: string;
  /** Max stagger between items in milliseconds. Default: 360. */
  maxStagger?: number;
}

/**
 * Adds an IntersectionObserver that reveals every element matching
 * `selector` by appending `activeClass` once it enters the viewport.
 *
 * Automatically no-ops when the user prefers reduced motion, and
 * falls back to "reveal everything" when IntersectionObserver isn't
 * available.
 */
export function useScrollReveal({
  selector = '.reveal',
  activeClass = 'in',
  rootMargin = '0px 0px -60px 0px',
  maxStagger = 360,
}: Options = {}): void {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    );
    if (elements.length === 0) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Reduced motion or no observer support → show everything at once.
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add(activeClass));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(activeClass);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin }
    );

    elements.forEach((el, index) => {
      if (!el.style.transitionDelay) {
        const delay = Math.min(index, 6) * (maxStagger / 6);
        el.style.transitionDelay = `${delay}ms`;
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector, activeClass, rootMargin, maxStagger]);
}