import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Reveal } from './Reveal';

const QUESTIONS = [
  {
    q: 'What exactly is a "cloud phone"?',
    a: 'A cloud phone is a full Android device running on remote ARM hardware in a data center. You get the complete OS — not an emulator or a container — streamed to your browser or controlled through an API. It behaves like a physical phone in every way that matters to an app.',
  },
  {
    q: 'How is this different from an Android emulator?',
    a: 'Emulators run x86 instructions translated to look like ARM, and most apps can detect them. NimbusFarm devices run native ARM64 on real mobile silicon with genuine hardware identifiers, so detection systems see a normal phone.',
  },
  {
    q: 'How fast can I deploy a new fleet?',
    a: 'A single device is ready in about 8 seconds. A batch of 500 devices typically finishes provisioning in under 90 seconds, and you can watch each one come online in real time on your dashboard.',
  },
  {
    q: 'Are the devices really isolated from each other?',
    a: 'Yes. Each instance is a separate virtual machine with its own kernel, storage, IMEI, MAC address, Android ID, advertising ID, and build fingerprint. There is no shared state between devices on your fleet or anyone else\u2019s.',
  },
  {
    q: 'Can I install my own APK or run custom scripts?',
    a: 'Absolutely. Upload APKs through the dashboard or API, push files over ADB, and run any automation framework you like — Appium, UiAutomator, Espresso, or your own tooling. Root access is available on request.',
  },
  {
    q: 'How does billing work if I only need devices occasionally?',
    a: 'Billing is per device-minute while a device is running. Stopped devices cost nothing and keep their full state, so you can spin up 500 phones for a launch week and pause them the moment you\u2019re done.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="section-spacing">
      <div className="container-responsive container-xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-xs font-medium uppercase tracking-[0.15em] text-primary">FAQ</p>
            <h2 className="mt-3 text-fluid-5xl font-semibold tracking-tight">Questions, answered.</h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="glass mx-auto mt-14 max-w-3xl rounded-2xl px-fluid-4">
            {QUESTIONS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  className={i !== QUESTIONS.length - 1 ? 'border-b border-border' : ''}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-fluid-lg font-semibold tracking-tight transition-colors hover:text-primary"
                  >
                    {item.q}
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-45 border-primary/40 bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <Plus className={`h-3 w-3 transition-colors ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-5 text-fluid-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}