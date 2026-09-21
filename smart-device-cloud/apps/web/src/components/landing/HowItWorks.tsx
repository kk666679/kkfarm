import { Reveal } from './Reveal';

const STEPS = [
  { n: '01', t: 'Pick a device profile', d: 'Choose from 40+ real Android profiles — Pixel, Samsung, Xiaomi, and more — each with matching hardware specs and build props.' },
  { n: '02', t: 'Deploy your fleet',     d: 'Set a count, pick a region, attach proxies. Your devices boot in under 10 seconds and appear on your dashboard instantly.' },
  { n: '03', t: 'Automate anything',     d: 'Upload an APK, push a script, or drive devices through our API. Run the same action across thousands of phones with one call.' },
  { n: '04', t: 'Scale up or down',      d: "Add 500 devices for a launch week, then drop back to 20. Billing is per-minute — you only pay for what's actually running." },
];

export function HowItWorks() {
  return (
    <section id="how" className="section-spacing">
      <div className="container-responsive container-xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-xs font-medium uppercase tracking-[0.15em] text-primary">
              Workflow
            </p>
            <h2 className="mt-3 text-fluid-5xl font-semibold tracking-tight">
              From zero to fleet in four steps.
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 grid-responsive-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 60}>
              <div className="glass glass-hover card-padding h-full">
                <div className="mb-4 flex items-center gap-3 text-fluid-xs font-semibold tracking-[0.1em] text-primary">
                  STEP {s.n}
                  <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                </div>
                <h3 className="text-fluid-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-fluid-sm text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}