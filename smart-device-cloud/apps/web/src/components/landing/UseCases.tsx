import type { ReactNode } from 'react';
import { CheckCircle2, MousePointerClick, Clock, Gamepad2, LineChart, Star } from 'lucide-react';
import { Reveal } from './Reveal';

const CASES: { icon: ReactNode; t: string; d: string }[] = [
  { icon: <CheckCircle2 />,     t: 'App testing & QA',    d: 'Run your regression suite across 200 device profiles in parallel. Ship with confidence, not with a drawer full of old phones.' },
  { icon: <MousePointerClick />,t: 'Ad verification',     d: 'Confirm creatives render correctly, track install attribution, and catch fraudulent placements across regions and carriers.' },
  { icon: <Clock />,            t: 'Social media ops',    d: 'Manage dozens of accounts from clean, isolated devices with dedicated IPs. Schedule, post, and monitor at scale.' },
  { icon: <Gamepad2 />,         t: 'Game automation',     d: 'Farm resources, run bot accounts, and stress-test multiplayer backends with hundreds of concurrent real clients.' },
  { icon: <LineChart />,        t: 'Data collection',     d: 'Gather app-store rankings, pricing, and content from real devices in real geographies — no emulator detection risk.' },
  { icon: <Star />,             t: 'Growth & marketing',  d: 'Test onboarding funnels, run referral flows, and validate campaign landing pages on the exact devices your users own.' },
];

export function UseCases() {
  return (
    <section id="use-cases" className="section-spacing">
      <div className="container-responsive container-xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-xs font-medium uppercase tracking-[0.15em] text-primary">
              Use cases
            </p>
            <h2 className="mt-3 text-fluid-5xl font-semibold tracking-tight">
              Built for teams who need many phones.
            </h2>
            <p className="mt-5 text-fluid-lg text-muted-foreground">
              If your workflow needs more than a handful of Android devices, it belongs on NimbusFarm.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid-responsive-3">
          {CASES.map((c, i) => (
            <Reveal key={c.t} delay={i * 40}>
              <div className="glass glass-hover flex h-full gap-4 card-padding">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-info/15 text-primary [&_svg]:h-4 [&_svg]:w-4">
                  {c.icon}
                </span>
                <div>
                  <h3 className="text-fluid-lg font-semibold">{c.t}</h3>
                  <p className="mt-1 text-fluid-sm text-muted-foreground">{c.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}