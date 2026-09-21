import useStickyHeader from '@/hooks/useStickyHeader';

const Logo = () => (
  <a href="#" className="logo">
    <span className="logo-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="#04070c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    </span>
    KK Farm
  </a>
);

export default function Nav() {
  const scrolled = useStickyHeader();

  return (
    <header id="header" className={scrolled ? 'scrolled' : ''}>
      <div className="wrap">
        <nav>
          <Logo />
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#usecases">Use cases</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-right">
            <a href="#" className="signin">Sign in</a>
            <a href="#pricing" className="btn btn-primary btn-sm">Start free</a>
          </div>
        </nav>
      </div>
    </header>
  );
}