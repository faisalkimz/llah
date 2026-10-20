import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Zap, DollarSign, FileText, BarChart3, Shield, Code2,
  ArrowRight, Check, ChevronRight, Menu, X,
  Activity, Layers, CreditCard, Bell, Key, Users
} from 'lucide-react';

/* ─── Hero Background ─── */
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 700"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Fine grid */}
        <defs>
          <pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <line x1="60" y1="0" x2="60" y2="60" stroke="#e5e5e5" strokeWidth="0.5" />
            <line x1="0" y1="60" x2="60" y2="60" stroke="#e5e5e5" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#heroGrid)" opacity="0.5" />

        {/* Horizontal flow lines */}
        <line x1="0" y1="180" x2="1200" y2="180" stroke="#d4d4d4" strokeWidth="0.5" className="hero-grid-line hero-grid-animate" />
        <line x1="0" y1="360" x2="1200" y2="360" stroke="#d4d4d4" strokeWidth="0.5" className="hero-grid-line hero-grid-animate" style={{ animationDelay: '2s' }} />
        <line x1="0" y1="540" x2="1200" y2="540" stroke="#d4d4d4" strokeWidth="0.5" className="hero-grid-line hero-grid-animate" style={{ animationDelay: '4s' }} />

        {/* Vertical flow lines */}
        <line x1="300" y1="0" x2="300" y2="700" stroke="#d4d4d4" strokeWidth="0.5" className="hero-grid-line hero-grid-animate" style={{ animationDelay: '1s' }} />
        <line x1="600" y1="0" x2="600" y2="700" stroke="#d4d4d4" strokeWidth="0.5" className="hero-grid-line hero-grid-animate" style={{ animationDelay: '3s' }} />
        <line x1="900" y1="0" x2="900" y2="700" stroke="#d4d4d4" strokeWidth="0.5" className="hero-grid-line hero-grid-animate" style={{ animationDelay: '5s' }} />

        {/* Infrastructure nodes */}
        <circle cx="300" cy="180" r="4" fill="#171717" opacity="0.12" className="hero-node-pulse" />
        <circle cx="600" cy="360" r="5" fill="#0284c7" opacity="0.18" className="hero-node-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="900" cy="180" r="4" fill="#171717" opacity="0.12" className="hero-node-pulse" style={{ animationDelay: '2s' }} />
        <circle cx="300" cy="540" r="3" fill="#171717" opacity="0.10" className="hero-node-pulse" style={{ animationDelay: '1.5s' }} />
        <circle cx="900" cy="540" r="4" fill="#0284c7" opacity="0.14" className="hero-node-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Connection paths between nodes */}
        <path d="M300 180 Q450 270 600 360" stroke="#0284c7" strokeWidth="1" fill="none" opacity="0.12" className="hero-data-flow" />
        <path d="M600 360 Q750 270 900 180" stroke="#0284c7" strokeWidth="1" fill="none" opacity="0.12" className="hero-data-flow" style={{ animationDelay: '1s' }} />
        <path d="M300 540 Q450 450 600 360" stroke="#171717" strokeWidth="1" fill="none" opacity="0.08" className="hero-data-flow" style={{ animationDelay: '2s' }} />
        <path d="M600 360 Q750 450 900 540" stroke="#171717" strokeWidth="1" fill="none" opacity="0.08" className="hero-data-flow" style={{ animationDelay: '3s' }} />

        {/* Fade edges */}
        <defs>
          <linearGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fafafa" stopOpacity="1" />
            <stop offset="100%" stopColor="#fafafa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fafafa" stopOpacity="0" />
            <stop offset="100%" stopColor="#fafafa" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fafafa" stopOpacity="0" />
            <stop offset="100%" stopColor="#fafafa" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="120" height="700" fill="url(#fadeLeft)" />
        <rect x="1080" y="0" width="120" height="700" fill="url(#fadeRight)" />
        <rect x="0" y="560" width="1200" height="140" fill="url(#fadeBottom)" />
      </svg>
    </div>
  );
}

/* ─── Code Block ─── */
function CodeBlock() {
  const lines = [
    { cls: 'text-[#6a9955]', text: '// Ingest a usage event' },
    { cls: 'text-[#d4d4d4]', text: '' },
    { cls: '', parts: [
      { cls: 'text-[#c586c0]', text: 'const ' },
      { cls: 'text-[#9cdcfe]', text: 'event' },
      { cls: 'text-[#d4d4d4]', text: ' = ' },
      { cls: 'text-[#c586c0]', text: 'await ' },
      { cls: 'text-[#dcdcaa]', text: 'llah' },
      { cls: 'text-[#d4d4d4]', text: '.' },
      { cls: 'text-[#dcdcaa]', text: 'events' },
      { cls: 'text-[#d4d4d4]', text: '.' },
      { cls: 'text-[#dcdcaa]', text: 'create' },
      { cls: 'text-[#d4d4d4]', text: '({' },
    ]},
    { cls: '', parts: [
      { cls: 'text-[#d4d4d4]', text: '  ' },
      { cls: 'text-[#9cdcfe]', text: 'customer_id' },
      { cls: 'text-[#d4d4d4]', text: ': ' },
      { cls: 'text-[#ce9178]', text: '"cus_8a3f2b"' },
      { cls: 'text-[#d4d4d4]', text: ',' },
    ]},
    { cls: '', parts: [
      { cls: 'text-[#d4d4d4]', text: '  ' },
      { cls: 'text-[#9cdcfe]', text: 'meter' },
      { cls: 'text-[#d4d4d4]', text: ': ' },
      { cls: 'text-[#ce9178]', text: '"api_requests"' },
      { cls: 'text-[#d4d4d4]', text: ',' },
    ]},
    { cls: '', parts: [
      { cls: 'text-[#d4d4d4]', text: '  ' },
      { cls: 'text-[#9cdcfe]', text: 'value' },
      { cls: 'text-[#d4d4d4]', text: ': ' },
      { cls: 'text-[#b5cea8]', text: '1' },
      { cls: 'text-[#d4d4d4]', text: ',' },
    ]},
    { cls: '', parts: [
      { cls: 'text-[#d4d4d4]', text: '  ' },
      { cls: 'text-[#9cdcfe]', text: 'idempotency_key' },
      { cls: 'text-[#d4d4d4]', text: ': ' },
      { cls: 'text-[#ce9178]', text: '"evt_unique_001"' },
    ]},
    { cls: 'text-[#d4d4d4]', text: '});' },
  ];

  return (
    <div className="rounded-lg border border-neutral-800 bg-[#1e1e1e] p-5 font-mono text-[13px] leading-relaxed">
      <div className="mb-3 flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></div>
        <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></div>
        <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></div>
        <span className="ml-2 text-[11px] text-neutral-500">ingest.js</span>
      </div>
      {lines.map((line, i) => (
        <div key={i}>
          {line.parts ? (
            line.parts.map((p, j) => (
              <span key={j} className={p.cls}>{p.text}</span>
            ))
          ) : (
            <span className={line.cls}>{line.text || '\u00A0'}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── How It Works Diagram ─── */
function HowItWorks() {
  const steps = [
    { icon: Key, label: 'Create API key', desc: 'Authenticate with your workspace' },
    { icon: Activity, label: 'Send events', desc: 'Track usage with the events API' },
    { icon: Layers, label: 'Configure pricing', desc: 'Attach meters to pricing rules' },
    { icon: FileText, label: 'Generate invoices', desc: 'Automated billing each period' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <div key={i} className="relative">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-white">
              <step.icon className="h-4.5 w-4.5 text-ink" size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1">Step {i + 1}</div>
              <div className="text-[15px] font-semibold text-ink">{step.label}</div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.desc}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="hidden lg:block absolute top-5 -right-3">
              <ChevronRight className="h-4 w-4 text-line" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Landing ─── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Real-time event ingestion',
      description: 'Send usage events via REST API with idempotency keys. Events are validated, deduplicated, and stored with full audit history.'
    },
    {
      icon: DollarSign,
      title: 'Flexible pricing models',
      description: 'Configure flat-rate, per-unit, tiered, volume, and graduated pricing. Attach pricing rules to meters and products.'
    },
    {
      icon: FileText,
      title: 'Automated invoicing',
      description: 'Close billing periods, aggregate usage, and generate immutable ledger entries and invoices automatically.'
    },
    {
      icon: BarChart3,
      title: 'Revenue analytics',
      description: 'Track revenue, usage trends, and customer health across your workspace with exportable reports.'
    },
    {
      icon: Shield,
      title: 'Audit trail and RBAC',
      description: 'Role-based access control, full audit logging, and session management built into every workspace.'
    },
    {
      icon: Code2,
      title: 'Developer-first API',
      description: 'RESTful API with consistent conventions, webhook delivery, API key management, and structured event logs.'
    },
  ];

  const audiences = [
    {
      icon: Code2,
      title: 'SaaS platforms',
      desc: 'Bill customers based on API calls, storage, compute time, or any custom metric your product tracks.'
    },
    {
      icon: Zap,
      title: 'AI and ML companies',
      desc: 'Meter token usage, model inference calls, or GPU time. Price per unit or in graduated tiers.'
    },
    {
      icon: Layers,
      title: 'API businesses',
      desc: 'Track request volume per endpoint. Apply rate limits and pricing tiers directly to your API usage data.'
    },
    {
      icon: CreditCard,
      title: 'Infrastructure providers',
      desc: 'Measure resource consumption across services. Consolidate billing for complex multi-product setups.'
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* ─── Navigation ─── */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        scrolled ? 'border-line bg-canvas/80 backdrop-blur-xl' : 'border-transparent bg-canvas'
      }`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-70" id="nav-logo">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">
                L
              </div>
              <span className="text-sm font-semibold tracking-tight text-ink">Llah</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-6 md:flex">
              <a href="#platform" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Platform</a>
              <a href="#developers" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Developers</a>
              <a href="#pricing" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Pricing</a>
            </div>

            {/* Auth buttons */}
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-neutral-100"
                id="nav-signin"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                id="nav-get-started"
              >
                Get started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="flex items-center justify-center rounded p-1.5 text-ink md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="border-t border-line pb-4 pt-3 md:hidden">
              <div className="flex flex-col gap-2">
                <a href="#platform" className="rounded px-3 py-2 text-sm text-muted hover:bg-neutral-100 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>Platform</a>
                <a href="#developers" className="rounded px-3 py-2 text-sm text-muted hover:bg-neutral-100 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>Developers</a>
                <a href="#pricing" className="rounded px-3 py-2 text-sm text-muted hover:bg-neutral-100 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                  <Link to="/login" className="rounded px-3 py-2 text-sm font-medium text-ink hover:bg-neutral-100">Sign in</Link>
                  <Link to="/register" className="rounded bg-ink px-3 py-2 text-center text-sm font-medium text-white">Get started</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden border-b border-line">
        <HeroBackground />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
              </span>
              NOW IN BETA
            </div>

            <h1 className="text-[44px] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[56px] lg:text-[64px]">
              Metered billing{' '}
              <br className="hidden sm:block" />
              for usage-based{' '}
              <br className="hidden sm:block" />
              businesses
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
              Llah handles event ingestion, usage aggregation, flexible pricing, subscriptions, invoicing, and revenue operations so you can focus on your product.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-ink/90 sm:w-auto"
                id="hero-cta-primary"
              >
                Start building free
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#platform"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-2.5 text-[14px] font-semibold text-ink shadow-sm transition-all hover:bg-canvas sm:w-auto"
                id="hero-cta-secondary"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-muted">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />
                Free to start
              </div>
              <div className="h-3 w-px bg-line"></div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />
                No credit card required
              </div>
              <div className="h-3 w-px bg-line"></div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />
                REST API
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platform Overview ─── */}
      <section id="platform" className="border-b border-line bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Platform</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">
              Everything between your product and getting paid
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              From the first usage event to the final invoice line item, Llah provides the complete billing stack for metered and subscription-based pricing.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-white p-7 transition-colors hover:bg-canvas" id={`feature-${idx}`}>
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-canvas text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                  <feature.icon size={17} strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-b border-line bg-canvas py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">How it works</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">
              Four steps from integration to invoice
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Integrate the API, define your meters and pricing, and Llah handles the rest.
            </p>
          </div>
          <div className="mt-14">
            <HowItWorks />
          </div>
        </div>
      </section>

      {/* ─── Developer Experience ─── */}
      <section id="developers" className="border-b border-line bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">For developers</div>
              <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">
                Built around a REST API you can integrate in an afternoon
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Every resource in Llah is accessible through a consistent REST API. Create customers, define meters, send usage events, and query invoices programmatically.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Key, text: 'Workspace-scoped API keys with configurable permissions' },
                  { icon: Activity, text: 'Idempotent event ingestion with deduplication' },
                  { icon: Bell, text: 'Outbound webhooks for billing lifecycle events' },
                  { icon: FileText, text: 'Structured event logs and audit trail' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-line bg-canvas">
                      <item.icon size={13} className="text-ink" strokeWidth={1.5} />
                    </div>
                    <span className="text-[14px] leading-relaxed text-ink">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:mt-8">
              <CodeBlock />
              <div className="mt-3 flex items-center gap-2 text-[12px] text-muted">
                <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
                Response: 201 Created
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section className="border-b border-line bg-canvas py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Use cases</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">
              Built for businesses that bill on usage
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Whether you charge per API call, per token, per seat, or per gigabyte, Llah supports the pricing model your business needs.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {audiences.map((aud, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-7 transition-all hover:shadow-sm" id={`usecase-${i}`}>
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-canvas">
                  <aud.icon size={17} className="text-ink" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-ink">{aud.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{aud.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Security and Trust ─── */}
      <section className="border-b border-line bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Security</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">
              Financial-grade data handling
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Llah stores monetary values in integer minor units with deterministic arithmetic. Ledger entries are append-only. Every data mutation is recorded in the audit trail.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              { title: 'Append-only ledger', desc: 'Financial records are immutable. Corrections are handled through adjustments, credits, and refunds with full traceability.' },
              { title: 'Role-based access', desc: 'Workspace members have scoped permissions. API keys are tied to workspaces with configurable access levels.' },
              { title: 'Audit logging', desc: 'Every action in the platform is recorded. Sessions are tracked and revocable. Sensitive operations require authentication.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas">
                  <Shield size={18} className="text-ink" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="border-b border-line bg-canvas py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Pricing</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">
              Start free, scale when ready
            </h2>
            <p className="mt-4 text-[15px] text-muted">
              No credit card required. Upgrade as your usage grows.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {/* Starter */}
            <div className="rounded-xl border border-line bg-white p-7 transition-all hover:shadow-sm">
              <div className="mb-5">
                <h3 className="text-[15px] font-semibold text-ink">Starter</h3>
                <p className="mt-1 text-[13px] text-muted">For testing and early development</p>
              </div>
              <div className="mb-6">
                <span className="text-[40px] font-bold tracking-tight text-ink">$0</span>
                <span className="text-[13px] text-muted">/month</span>
              </div>
              <ul className="mb-7 space-y-2.5">
                {['10,000 events per month', 'Unlimited customers', 'REST API access', 'Community support'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" strokeWidth={2.5} />
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full rounded-full border border-line bg-white py-2.5 text-center text-[13px] font-semibold text-ink transition-all hover:bg-canvas"
                id="pricing-starter-cta"
              >
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-xl border-2 border-ink bg-white p-7 shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-ink px-3 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                  Recommended
                </span>
              </div>
              <div className="mb-5">
                <h3 className="text-[15px] font-semibold text-ink">Pro</h3>
                <p className="mt-1 text-[13px] text-muted">For growing businesses</p>
              </div>
              <div className="mb-6">
                <span className="text-[40px] font-bold tracking-tight text-ink">$99</span>
                <span className="text-[13px] text-muted">/month</span>
              </div>
              <ul className="mb-7 space-y-2.5">
                {['1M events per month', 'Advanced analytics', 'Priority support', 'Team collaboration', 'Custom reports'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ink" strokeWidth={2.5} />
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full rounded-full bg-ink py-2.5 text-center text-[13px] font-semibold text-white transition-all hover:bg-ink/90"
                id="pricing-pro-cta"
              >
                Start free trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl border border-line bg-white p-7 transition-all hover:shadow-sm">
              <div className="mb-5">
                <h3 className="text-[15px] font-semibold text-ink">Enterprise</h3>
                <p className="mt-1 text-[13px] text-muted">For large-scale operations</p>
              </div>
              <div className="mb-6">
                <span className="text-[40px] font-bold tracking-tight text-ink">Custom</span>
              </div>
              <ul className="mb-7 space-y-2.5">
                {['Unlimited events', 'SSO and SAML', 'Dedicated support', 'SLA available', 'Custom integrations'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" strokeWidth={2.5} />
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="block w-full rounded-full border border-line bg-white py-2.5 text-center text-[13px] font-semibold text-ink transition-all hover:bg-canvas"
                id="pricing-enterprise-cta"
              >
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="border-b border-line bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
            Start billing for what your product actually delivers
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted">
            Create an account, integrate the API, and have your first usage event tracked in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-ink/90 sm:w-auto"
              id="final-cta"
            >
              Create free account
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="text-[14px] font-semibold text-ink transition-opacity hover:opacity-70"
            >
              Sign in to existing account
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-canvas py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[9px] font-bold text-white">
                  L
                </div>
                <span className="text-[13px] font-semibold text-ink">Llah</span>
              </div>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted">
                Metered billing and revenue operations for SaaS, AI, and API businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Product</div>
              <ul className="space-y-2">
                <li><a href="#platform" className="text-[13px] text-muted transition-colors hover:text-ink">Platform</a></li>
                <li><a href="#pricing" className="text-[13px] text-muted transition-colors hover:text-ink">Pricing</a></li>
                <li><a href="#developers" className="text-[13px] text-muted transition-colors hover:text-ink">Developers</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Resources</div>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-[13px] text-muted transition-colors hover:text-ink">Sign in</Link></li>
                <li><Link to="/register" className="text-[13px] text-muted transition-colors hover:text-ink">Get started</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Legal</div>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-[13px] text-muted transition-colors hover:text-ink">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[13px] text-muted transition-colors hover:text-ink">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
            <p className="text-[12px] text-muted">&copy; {new Date().getFullYear()} Llah. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
