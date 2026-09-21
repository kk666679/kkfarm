import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { UseCases } from '@/components/landing/UseCases';
import { Metrics } from '@/components/landing/Metrics';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTABanner } from '@/components/landing/CTABanner';
import Trust from '@/components/landing/Trust';
import Footer from '@/components/landing/Footer';

import { useSmoothAnchors } from '@/hooks/useSmoothAnchor';
import { useScrollReveal } from '@/hooks/useScrollReveal';

import '@/styles/landing.css';

/**
 * Public marketing landing page.
 *
 * Responsibilities are intentionally thin — all behaviour lives in
 * dedicated hooks so this file stays a pure composition of sections.
 */
export default function Landing() {
  // Intercept in-page `#anchor` clicks and scroll with a nav-offset.
  useSmoothAnchors({ offset: 80 });

  // Fade-in any element carrying `.reveal` as it enters the viewport.
  useScrollReveal();

  return (
    <div className="min-h-dvh bg-background text-foreground no-overflow-x">
      {/* Skip link — keyboard users can jump straight to the content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <Metrics />
        <Pricing />
        <FAQ />
        <CTABanner />
        <Trust />
      </main>

      <Footer />
    </div>
  );
}