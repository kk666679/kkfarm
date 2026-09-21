import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from './Reveal';

export function CTABanner() {
  return (
    <section className="pb-24 lg:pb-32">
      <div className="container-responsive container-xl">
        <Reveal>
          <div className="glass-accent relative overflow-hidden rounded-3xl px-fluid-5 py-fluid-8 text-center lg:px-fluid-8">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
              <div className="absolute -bottom-32 right-10 h-64 w-64 rounded-full bg-info/20 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-fluid-4xl font-semibold tracking-tight">
                Your first 10 phones are on us.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-fluid-base text-muted-foreground">
                Start a free 7-day trial with full API access. No credit card, no sales call, no hardware to unbox.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" className="rounded-xl" asChild>
                  <Link to="/signup">
                    Create free account <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl glass" asChild>
                  <Link to="/contact">Book a demo</Link>
                </Button>
              </div>
              <p className="mt-6 text-fluid-xs text-muted-foreground">
                Free for 7 days · Cancel anytime · SOC 2 Type II compliant
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}