import type { ReactNode } from 'react';
import { Code2, ShieldCheck, MonitorPlay, Globe2, Network } from 'lucide-react';
import { Reveal } from './Reveal';

function FeatureCard({
  icon, title, body,
}: { icon: ReactNode; title: string; body: string }) {
  return (
    <Reveal>
      <div className="glass glass-hover card-padding h-full">
        <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
        <h3 className="text-fluid-lg font-semibold">{title}</h3>
        <p className="mt-2 text-fluid-sm text-muted-foreground">{body}</p>
      </div>
    </Reveal>
  );
}

export function Features() {
  return (
    <section id="features" className="section-spacing">
      <div className="container-responsive container-xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-xs font-medium uppercase tracking-[0.15em] text-primary">
              Platform
            </p>
            <h2 className="mt-3 text-fluid-5xl font-semibold tracking-tight">
              Real ARM hardware.<br />Zero physical phones.
            </h2>
            <p className="mt-5 text-fluid-lg text-muted-foreground">
              Every instance runs on genuine ARM silicon with its own isolated Android
              environment — so your apps behave exactly as they would on a real device in a real hand.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="glass glass-hover card-padding-lg h-full">
              <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-fluid-xl font-semibold">One API. Infinite phones.</h3>
              <p className="mt-2 max-w-lg text-fluid-sm text-muted-foreground">
                Provision, control, and tear down entire fleets with a few lines of code. REST,
                WebSocket, and raw ADB — whatever your stack already speaks.
              </p>
              <pre className="glass-light mt-6 overflow-x-auto rounded-xl p-4 text-fluid-xs leading-relaxed text-muted-foreground">
{`// spin up 250 isolated devices in ~8s
const fleet = await nimbus.devices.create({
  profile: "pixel-8-arm",
  count:   250,
  region:  "ap-southeast",
  proxy:   "residential-my"
});

await fleet.run("openApp", { id: "com.shop.app" });
// → 250 devices ready ✓`}
              </pre>
            </div>
          </Reveal>

          <FeatureCard
            icon={<ShieldCheck />}
            title="Fingerprint isolation"
            body="Every device ships with a unique IMEI, MAC, Android ID, GAID, and build props. No shared DNA between instances — ever."
          />
          <FeatureCard
            icon={<MonitorPlay />}
            title="60fps live streaming"
            body="Watch and interact with any device in your browser at 60fps. Take manual control in one click, then hand it back to the script."
          />
          <FeatureCard
            icon={<Globe2 />}
            title="12 global regions"
            body="Deploy close to your users. Sub-40ms latency from North America, Europe, Southeast Asia, and Latin America."
          />
          <FeatureCard
            icon={<Network />}
            title="Proxy & carrier routing"
            body="Attach a dedicated residential or mobile proxy to each device. Per-instance IP rotation and carrier selection built in."
          />
        </div>
      </div>
    </section>
  );
}