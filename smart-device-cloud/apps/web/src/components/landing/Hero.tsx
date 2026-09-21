import { useEffect, useState, type CSSProperties } from 'react';

const PhoneCard = ({ delay }) => (
  <div className="dev" style={{ '--d': `${delay}s` } as CSSProperties & { '--d': string }}>
    <div className="dev-bar" />
    <div className="dev-line" />
    <div className="dev-line s" />
    <div className="dev-block" />
  </div>
);

export default function Hero() {
  const [online, setOnline] = useState(1284);

  useEffect(() => {
    const id = setInterval(() => {
      setOnline(1284 + Math.floor(Math.random() * 9) - 4);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-glow b" />
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="badge reveal">
              <span className="dot" />
              Now live in 12 edge regions
            </div>
            <h1 className="reveal">Run a thousand phones from one screen.</h1>
            <p className="lead reveal">
              KK Farm gives you ARM-native cloud phones that boot in seconds. Automate any
              Android app, scale QA testing, and grow your fleet — without buying, racking, or
              charging a single physical device.
            </p>
            <div className="hero-cta reveal">
              <a href="#pricing" className="btn btn-primary">
                Start free trial
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a href="#how" className="btn btn-ghost">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch 2-min demo
              </a>
            </div>
            <div className="hero-meta reveal">
              <div className="avatars">
                <span /><span /><span /><span />
              </div>
              <span>
                Trusted by <strong style={{ color: '#c9d3e4', fontWeight: 600 }}>2,400+</strong> automation teams
              </span>
            </div>
          </div>

          <div className="reveal">
            <div className="fleet-panel">
              <div className="fleet-top">
                <div className="fleet-title">
                  <span className="live" /> Fleet · ap-southeast
                </div>
                <div className="fleet-count">{online.toLocaleString()} online</div>
              </div>
              <div className="fleet">
                {Array.from({ length: 12 }).map((_, i) => (
                  <PhoneCard key={i} delay={i * 0.35} />
                ))}
              </div>

              <div className="status-chip">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
                  </svg>
                </span>
                <div>
                  <b>7.8s</b>
                  <small>AVG BOOT TIME</small>
                </div>
              </div>

              <div className="status-chip two">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <div>
                  <b>Isolated</b>
                  <small>DEVICE FINGERPRINTS</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}