import { useCountUp } from '@/hooks/useCountUp';

const METRICS = [
  { value: 99.98, decimals: 2, suffix: '%',  label: 'Uptime SLA' },
  { value: 7.8,   decimals: 1, suffix: 's',  label: 'Average boot time' },
  { value: 12,    decimals: 0, suffix: '',   label: 'Edge regions' },
  { value: 340,   decimals: 0, suffix: 'K+', label: 'Devices deployed' },
];

function Metric({
  value, decimals, suffix, label,
}: (typeof METRICS)[number]) {
  const { ref, value: display } = useCountUp(value, { decimals, suffix });
  return (
    <div className="text-center">
      <div
        ref={ref}
        className="bg-gradient-to-br from-primary to-info bg-clip-text text-fluid-5xl font-bold tracking-tight text-transparent"
      >
        {display}
      </div>
      <div className="mt-2 text-fluid-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export function Metrics() {
  return (
    <section className="border-y border-border/60 bg-foreground/[0.02] py-16 lg:py-20">
      <div className="container-responsive container-xl">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {METRICS.map((m) => (
            <Metric key={m.label} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}