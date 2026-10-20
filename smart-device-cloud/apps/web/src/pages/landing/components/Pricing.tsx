import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from './Reveal';

type Cycle = 'monthly' | 'annual';

type Plan = {
  name: string;
  monthly: string;
  annual: string;
  desc: string;
  features: string[];
  cta: string;
  variant: 'default' | 'outline';
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthly: '$49',
    annual: '$39',
    desc: 'For solo developers and small automation projects.',
    features: [
      'Up to 10 concurrent devices',
      '2 device profiles',
      'REST API + ADB access',
      '720p screen streaming',
      'Community support',
    ],
    cta: 'Start free trial',
    variant: 'outline',
  },
  {
    name: 'Growth',
    monthly: '$199',
    annual: '$159',
    desc: 'For teams running production automation at scale.',
    features: [
      'Up to 100 concurrent devices',
      'All 40+ device profiles',
      'Per-device proxy routing',
      '60fps streaming + batch control',
      'Team roles & audit logs',
      'Priority support, 4h response',
    ],
    cta: 'Start free trial',
    variant: 'default',
    featured: true,
  },
  {
    name: 'Scale',
    monthly: 'Custom',
    annual: 'Custom',
    desc: 'For enterprises with dedicated infrastructure needs.',
    features: [
      'Unlimited concurrent devices',
      'Dedicated bare-metal nodes',
      'Custom device profiles & ROMs',
      'VPC peering & SSO / SAML',
      '99.99% uptime SLA',
      'Dedicated solutions engineer',
    ],
    cta: 'Talk to sales',
    variant: 'outline',
  },
];

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>('monthly');

  return (
    <section id="pricing" className="section-spacing">
      <div className="container-responsive container-xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-xs font-medium uppercase tracking-[0.15em] text-primary">
              Pricing
            </p>
            <h2 className="mt-3 text-fluid-5xl font-semibold tracking-tight">
              Pay per device. Per minute.
            </h2>
            <p className="mt-5 text-fluid-lg text-muted-foreground">
              No hardware, no contracts, no idle costs. Scale your fleet up for a launch and
              back down the same day.
            </p>

            <div className="glass mt-7 inline-flex items-center gap-1 rounded-xl p-1">
              {(['monthly', 'annual'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`rounded-lg px-4 py-2 text-fluid-sm font-medium capitalize transition-all ${
                    cycle === c
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c}
                  {c === 'annual' && (
                    <span className="ml-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[0.65rem] font-semibold text-success">
                      −20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-start">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 60}>
              <div
                className={`relative h-full rounded-2xl card-padding-lg ${
                  p.featured
                    ? 'glass-accent shadow-2xl shadow-primary/10'
                    : 'glass glass-hover'
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-foreground">
                    Most popular
                  </span>
                )}
                <div className="text-fluid-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {p.name}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-fluid-5xl font-bold tracking-tight">
                    {cycle === 'monthly' ? p.monthly : p.annual}
                  </span>
                  {p.monthly !== 'Custom' && (
                    <span className="text-fluid-sm text-muted-foreground">/ month</span>
                  )}
                </div>
                <p className="mt-2 text-fluid-sm text-muted-foreground">{p.desc}</p>

                <hr className="my-6 border-border" />

                <ul className="flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-fluid-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={p.variant}
                  size="lg"
                  className="mt-8 w-full rounded-xl"
                  asChild
                >
                  <Link to={p.name === 'Scale' ? '/contact' : '/signup'}>{p.cta}</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}