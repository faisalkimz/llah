import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Zap, DollarSign, FileText, BarChart3, Shield, Code2,
  ArrowRight, Check, Menu, X, Sun, Moon,
  Activity, Layers, CreditCard, Bell, Key, Lock, GitBranch
} from 'lucide-react';
import HeroScene from '../components/marketing/HeroScene.jsx';
import InfrastructureDiagram from '../components/marketing/InfrastructureDiagram.jsx';
import ApiDemo from '../components/marketing/ApiDemo.jsx';
import BillingLifecycle from '../components/marketing/BillingLifecycle.jsx';
import FloatingParticles from '../components/FloatingParticles.jsx';

/* ═══════════════════════════════════════════════════
   HERO AURORA BACKGROUND
   Animated flowing gradients, particles, and light trails
═══════════════════════════════════════════════════ */
function HeroAuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {/* Deep base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdfa]"></div>

      {/* ─── Large Aurora Blobs ─── */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="aurora-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="70" />
          </filter>
          <filter id="aurora-blur-xl" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
          </filter>
          <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
            <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sweep-grad-2" x1="0" y1="0.5" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Large flowing blobs */}
        <ellipse cx="1100" cy="180" rx="450" ry="320" fill="#0ea5e9" opacity="0.18" filter="url(#aurora-blur)" className="aurora-blob-1" />
        <ellipse cx="150" cy="350" rx="380" ry="280" fill="#06b6d4" opacity="0.12" filter="url(#aurora-blur-xl)" className="aurora-blob-2" />
        <ellipse cx="750" cy="600" rx="500" ry="220" fill="#0284c7" opacity="0.10" filter="url(#aurora-blur-xl)" className="aurora-blob-3" />
        <circle cx="350" cy="150" r="200" fill="#7dd3fc" opacity="0.14" filter="url(#aurora-blur)" className="aurora-blob-2" />
        <circle cx="1200" cy="500" r="180" fill="#10b981" opacity="0.07" filter="url(#aurora-blur-xl)" className="aurora-blob-1" />

        {/* Sweeping light bands */}
        <rect x="-200" y="100" width="600" height="250" rx="125" fill="url(#sweep-grad)" className="aurora-sweep" />
        <rect x="-200" y="350" width="500" height="200" rx="100" fill="url(#sweep-grad-2)" className="aurora-sweep-delayed" />

        {/* Flowing wave curves */}
        <path d="M0 450 Q200 380 400 420 Q600 460 800 400 Q1000 340 1200 380 Q1400 420 1600 360" stroke="#0ea5e9" strokeWidth="1" fill="none" opacity="0.15" className="wave-path" />
        <path d="M0 500 Q250 440 500 480 Q750 520 1000 460 Q1250 400 1500 440" stroke="#06b6d4" strokeWidth="0.8" fill="none" opacity="0.12" className="wave-path-slow" />
        <path d="M0 320 Q300 280 600 310 Q900 340 1200 290 Q1500 240 1800 280" stroke="#7dd3fc" strokeWidth="0.6" fill="none" opacity="0.1" className="wave-path" style={{ animationDelay: '2s' }} />

        {/* Expanding pulse rings from center */}
        <circle cx="720" cy="350" r="80" fill="none" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.2" className="ring-expand" />
        <circle cx="720" cy="350" r="80" fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity="0.15" className="ring-expand" style={{ animationDelay: '2s' }} />

        {/* Orbiting glow */}
        <g style={{ transformOrigin: '720px 350px' }}>
          <circle cx="720" cy="350" r="0" fill="transparent">
            <animateTransform attributeName="transform" type="rotate" from="0 720 350" to="360 720 350" dur="25s" repeatCount="indefinite" />
          </circle>
          <circle cx="840" cy="350" r="4" fill="#0ea5e9" opacity="0.4" filter="url(#aurora-blur)">
            <animateTransform attributeName="transform" type="rotate" from="0 720 350" to="360 720 350" dur="25s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Floating particles */}
        {[
          { cx: 200, cy: 600, delay: '0s', dur: '5s' },
          { cx: 500, cy: 700, delay: '1s', dur: '6s' },
          { cx: 800, cy: 650, delay: '2s', dur: '5.5s' },
          { cx: 1100, cy: 700, delay: '0.5s', dur: '7s' },
          { cx: 350, cy: 750, delay: '3s', dur: '6s' },
          { cx: 1000, cy: 600, delay: '1.5s', dur: '5s' },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="1.5" fill="#0ea5e9" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0.6;0" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${p.cy};${p.cy - 200}`} dur={p.dur} begin={p.delay} repeatCount="indefinite" />
            <animate attributeName="cx" values={`${p.cx};${p.cx + 25}`} dur={p.dur} begin={p.delay} repeatCount="indefinite" />
            <animate attributeName="r" values="1.5;0.8" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Floating particles */}
      <FloatingParticles count={55} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════════ */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const capabilities = [
    {
      icon: Zap,
      title: 'Real-time event ingestion',
      description: 'Send usage events via REST API with idempotency keys. Events are validated, deduplicated, and stored with full audit history.',
      accent: 'from-sky-500/10 to-cyan-500/5',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500',
    },
    {
      icon: DollarSign,
      title: 'Flexible pricing models',
      description: 'Configure flat-rate, per-unit, tiered, volume, and graduated pricing. Attach pricing rules to meters and products.',
      accent: 'from-emerald-500/10 to-teal-500/5',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500',
    },
    {
      icon: FileText,
      title: 'Automated invoicing',
      description: 'Close billing periods, aggregate usage, and generate immutable ledger entries and invoices automatically.',
      accent: 'from-blue-500/10 to-indigo-500/5',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500',
    },
    {
      icon: BarChart3,
      title: 'Revenue analytics',
      description: 'Track revenue, usage trends, and customer health across your workspace with exportable reports.',
      accent: 'from-violet-500/10 to-purple-500/5',
      iconBg: 'bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500',
    },
    {
      icon: Shield,
      title: 'Audit trail and RBAC',
      description: 'Role-based access control, full audit logging, and session management built into every workspace.',
      accent: 'from-amber-500/10 to-orange-500/5',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
    },
    {
      icon: Code2,
      title: 'Developer-first API',
      description: 'RESTful API with consistent conventions, webhook delivery, API key management, and structured event logs.',
      accent: 'from-rose-500/10 to-pink-500/5',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500',
    },
  ];

  const audiences = [
    {
      icon: Code2,
      title: 'SaaS platforms',
      desc: 'Bill customers based on API calls, storage, compute time, or any custom metric your product tracks.',
      example: 'api_requests, storage_gb, active_users',
      color: 'border-sky-200 bg-gradient-to-br from-sky-50/80 to-white hover:border-sky-300 hover:shadow-sky-100/50',
      dot: 'bg-sky-500',
    },
    {
      icon: Zap,
      title: 'AI and ML companies',
      desc: 'Meter token usage, model inference calls, or GPU time. Price per unit or in graduated tiers.',
      example: 'tokens_processed, inference_calls',
      color: 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white hover:border-emerald-300 hover:shadow-emerald-100/50',
      dot: 'bg-emerald-500',
    },
    {
      icon: Layers,
      title: 'API businesses',
      desc: 'Track request volume per endpoint. Apply rate limits and pricing tiers directly to your API usage data.',
      example: 'requests_per_endpoint, bandwidth_mb',
      color: 'border-violet-200 bg-gradient-to-br from-violet-50/80 to-white hover:border-violet-300 hover:shadow-violet-100/50',
      dot: 'bg-violet-500',
    },
    {
      icon: CreditCard,
      title: 'Infrastructure providers',
      desc: 'Measure resource consumption across services. Consolidate billing for complex multi-product setups.',
      example: 'compute_hours, data_transfer_gb',
      color: 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white hover:border-amber-300 hover:shadow-amber-100/50',
      dot: 'bg-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ NAVIGATION ═══ */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-line/80 bg-white/70 backdrop-blur-xl shadow-sm'
          : 'border-transparent bg-transparent'
      }`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-70" id="nav-logo">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-ink to-neutral-700 text-[11px] font-extrabold text-white shadow-sm">
                L
              </div>
              <span className="text-[15px] font-bold tracking-tight text-ink">Llah</span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              <a href="#platform" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Platform</a>
              <a href="#how-it-works" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">How it works</a>
              <a href="#developers" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Developers</a>
              <a href="#pricing" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Pricing</a>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button
                onClick={() => setDark(v => !v)}
                className="flex items-center justify-center rounded-full p-2 text-muted transition-colors hover:bg-neutral-100 hover:text-ink"
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                id="nav-dark-toggle"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link to="/login" className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-neutral-100" id="nav-signin">
                Sign in
              </Link>
              <Link to="/register" className="rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-ink/90 hover:shadow-md" id="nav-get-started">
                Get started free
              </Link>
            </div>

            <button
              className="flex items-center justify-center rounded-lg p-2 text-ink hover:bg-neutral-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-line pb-4 pt-3 md:hidden">
              <div className="flex flex-col gap-1">
                <a href="#platform" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-neutral-50 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>Platform</a>
                <a href="#how-it-works" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-neutral-50 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                <a href="#developers" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-neutral-50 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>Developers</a>
                <a href="#pricing" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-neutral-50 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
                  <Link to="/login" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-neutral-50">Sign in</Link>
                  <Link to="/register" className="rounded-lg bg-ink px-3 py-2.5 text-center text-sm font-semibold text-white">Get started free</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ═══ HERO — Mesh Gradient + Product Scene ═══ */}
      <section className="relative overflow-hidden">
        <HeroAuroraBackground />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-sky-700 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500"></span>
              </span>
              NOW IN BETA
            </div>

            <h1 className="text-[42px] font-extrabold leading-[1.06] tracking-[-0.04em] text-ink sm:text-[54px] lg:text-[64px]">
              Metered billing
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">infrastructure</span> for
              <br className="hidden sm:block" />
              modern software
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[17px]">
              Track usage events, configure flexible pricing, generate invoices, and manage subscriptions. Llah is the billing layer between your product and revenue.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ink via-neutral-800 to-ink px-7 py-3 text-[14px] font-bold text-white shadow-lg shadow-ink/20 transition-all hover:shadow-xl hover:shadow-ink/25 sm:w-auto"
                id="hero-cta-primary"
              >
                Start building free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white/80 px-7 py-3 text-[14px] font-bold text-ink shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md sm:w-auto"
                id="hero-cta-secondary"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-medium text-muted">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                Free to start
              </div>
              <div className="h-3.5 w-px bg-line"></div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                No credit card required
              </div>
              <div className="h-3.5 w-px bg-line"></div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                REST API
              </div>
            </div>
          </div>

          {/* Product scene */}
          <div className="mt-14 pb-8 lg:mt-20 lg:pb-12">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM CAPABILITIES — Colored Bento Grid ═══ */}
      <section id="platform" className="bg-gradient-to-b from-white via-slate-50/50 to-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-600">Platform</div>
            <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">
              Everything between your product and getting paid
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-[16px]">
              From the first usage event to the final invoice line item, Llah provides the complete billing stack for metered and subscription-based pricing.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-2xl border border-line bg-white p-7 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-200/50 hover:-translate-y-0.5`}
                id={`feature-${idx}`}
              >
                {/* Colored gradient accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cap.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}></div>

                <div className="relative">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${cap.iconBg}`}>
                    <cap.icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[16px] font-bold text-ink">{cap.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ARCHITECTURE — Infrastructure Diagram ═══ */}
      <section id="how-it-works" className="relative bg-gradient-to-b from-slate-50 via-sky-50/30 to-white py-24 lg:py-32">
        {/* Subtle accent shimmer */}
        <div className="absolute inset-0 accent-shimmer" aria-hidden="true"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">Architecture</div>
            <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">
              How events become invoices
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-[16px]">
              Usage events flow through a pipeline of validation, metering, pricing, and invoicing. Each stage is auditable and configurable.
            </p>
          </div>

          <div className="mt-14 overflow-x-auto">
            <InfrastructureDiagram />
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Key, step: '01', label: 'Ingest events', desc: 'Your application sends usage events to the REST API with idempotency keys for deduplication.', color: 'text-sky-600 bg-sky-50' },
              { icon: Activity, step: '02', label: 'Aggregate usage', desc: 'Meters aggregate events using SUM, COUNT, MAX, or LATEST over configurable billing periods.', color: 'text-cyan-600 bg-cyan-50' },
              { icon: DollarSign, step: '03', label: 'Apply pricing', desc: 'Pricing rules calculate charges using flat-rate, per-unit, tiered, volume, or graduated models.', color: 'text-blue-600 bg-blue-50' },
              { icon: FileText, step: '04', label: 'Generate invoices', desc: 'Invoices are generated with itemized line items and stored as immutable ledger entries.', color: 'text-emerald-600 bg-emerald-50' },
            ].map((item, i) => (
              <div key={i}>
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.color} mb-3`}>
                  <item.icon size={15} strokeWidth={1.5} />
                </div>
                <div className="text-[10px] font-bold tracking-wider text-muted mb-1">{item.step}</div>
                <h3 className="text-[15px] font-bold text-ink">{item.label}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEVELOPER EXPERIENCE — Dark Section ═══ */}
      <section id="developers" className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] py-24 lg:py-32 overflow-hidden">
        {/* Subtle colored glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]" aria-hidden="true"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" aria-hidden="true"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <div className="mb-3 inline-flex items-center rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-400">For developers</div>
            <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-white sm:text-[42px]">
              A REST API you can integrate in an afternoon
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-400 sm:text-[16px]">
              Every resource in Llah is accessible through a consistent API. Create customers, define meters, send usage events, and query invoices programmatically.
            </p>
          </div>

          <ApiDemo />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Key, label: 'API key auth', desc: 'Workspace-scoped keys with configurable permissions', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
              { icon: GitBranch, label: 'Idempotent writes', desc: 'Every mutation supports idempotency keys', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
              { icon: Bell, label: 'Webhooks', desc: 'Outbound events for billing lifecycle changes', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { icon: Lock, label: 'Audit trail', desc: 'Every API call is logged with full context', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${item.color}`}>
                  <item.icon size={14} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">{item.label}</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BILLING LIFECYCLE ═══ */}
      <section className="bg-gradient-to-b from-white via-emerald-50/20 to-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">Lifecycle</div>
            <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">
              Every billing event, start to finish
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-[16px]">
              Subscriptions move through a clear lifecycle. Each state transition is recorded in the ledger with full audit context.
            </p>
          </div>

          <div className="mt-14">
            <BillingLifecycle />
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-5 sm:grid-cols-3">
            {[
              { title: 'Subscriptions', desc: 'Create, update, pause, and cancel. Attach plans with multiple pricing components.', items: ['Plan management', 'Proration support', 'Status tracking'], color: 'border-sky-200/60 hover:border-sky-300' },
              { title: 'Credits and adjustments', desc: 'Issue credits, apply adjustments, and process refunds with immutable ledger entries.', items: ['Credit balance', 'Line-item adjustments', 'Refund processing'], color: 'border-emerald-200/60 hover:border-emerald-300' },
              { title: 'Coupons and discounts', desc: 'Create percentage or fixed-amount coupons with configurable usage limits.', items: ['Percentage coupons', 'Fixed-amount coupons', 'Usage limits'], color: 'border-violet-200/60 hover:border-violet-300' },
            ].map((card, i) => (
              <div key={i} className={`rounded-2xl border bg-white p-6 transition-all hover:shadow-md ${card.color}`}>
                <h3 className="text-[15px] font-bold text-ink">{card.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{card.desc}</p>
                <ul className="mt-4 space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-[12px]">
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" strokeWidth={3} />
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="bg-gradient-to-b from-slate-50/80 via-white to-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-600">Use cases</div>
            <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">
              Built for businesses that bill on usage
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-[16px]">
              Whether you charge per API call, per token, per seat, or per gigabyte, Llah supports the pricing model your business needs.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {audiences.map((aud, i) => (
              <div key={i} className={`group rounded-2xl border p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${aud.color}`} id={`usecase-${i}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white border border-line shadow-sm">
                    <aud.icon size={18} className="text-ink" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold text-ink">{aud.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{aud.desc}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 border border-line px-3 py-1.5 shadow-sm">
                      <div className={`h-1.5 w-1.5 rounded-full ${aud.dot}`}></div>
                      <span className="text-[10px] font-mono text-muted">{aud.example}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECURITY AND TRUST ═══ */}
      <section className="bg-gradient-to-b from-white via-amber-50/20 to-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-600">Security</div>
              <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[38px]">
                Financial-grade data handling
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">
                Llah stores monetary values in integer minor units with deterministic arithmetic. Ledger entries are append-only. Every data mutation is recorded.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Lock, title: 'Append-only ledger', desc: 'Financial records are immutable. Corrections use adjustments, credits, and refunds with full traceability.', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                  { icon: Shield, title: 'Role-based access', desc: 'Workspace members have scoped permissions. API keys are tied to workspaces with configurable access.', color: 'bg-sky-50 text-sky-600 border-sky-100' },
                  { icon: Activity, title: 'Audit logging', desc: 'Every action is recorded. Sessions are tracked and revocable. Sensitive operations require authentication.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${item.color}`}>
                      <item.icon size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-ink">{item.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ledger preview */}
            <div className="rounded-2xl border border-line bg-gradient-to-br from-slate-50 to-white p-2 shadow-xl shadow-neutral-200/40">
              <div className="rounded-xl border border-line bg-white overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50">
                      <FileText size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-[13px] font-bold text-ink">Ledger Entries</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted bg-canvas px-2 py-0.5 rounded-full border border-line">INV-2024-0047</span>
                </div>
                <div className="divide-y divide-line/60">
                  {[
                    { type: 'CHARGE', desc: 'API Requests (Tier 1: 0-50k)', qty: '50,000', amount: '+$500.00', color: 'text-sky-600 bg-sky-50' },
                    { type: 'CHARGE', desc: 'API Requests (Tier 2: 50k-150k)', qty: '84,000', amount: '+$1,260.00', color: 'text-sky-600 bg-sky-50' },
                    { type: 'CHARGE', desc: 'Storage (per GB)', qty: '580 GB', amount: '+$580.00', color: 'text-sky-600 bg-sky-50' },
                    { type: 'CREDIT', desc: 'Volume discount', qty: '', amount: '-$120.00', color: 'text-emerald-600 bg-emerald-50' },
                    { type: 'TAX', desc: 'Sales tax (8.875%)', qty: '', amount: '+$197.03', color: 'text-amber-600 bg-amber-50' },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <span className={`text-[9px] font-bold tracking-wider rounded-full px-2 py-0.5 ${entry.color}`}>
                        {entry.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] text-ink font-medium">{entry.desc}</span>
                        {entry.qty && <span className="text-[10px] text-muted ml-2">x {entry.qty}</span>}
                      </div>
                      <span className={`text-[12px] font-mono font-bold ${entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-ink'}`}>{entry.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-ink/10 px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-white">
                  <span className="text-[13px] font-bold text-ink">Total</span>
                  <span className="text-[16px] font-extrabold font-mono text-ink">$2,417.03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="bg-gradient-to-b from-slate-50 via-white to-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">Pricing</div>
            <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">
              Start free, scale when ready
            </h2>
            <p className="mt-5 text-[15px] text-muted sm:text-[16px]">
              No credit card required. Upgrade as your usage grows.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {/* Starter */}
            <div className="rounded-2xl border border-line bg-white p-8 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <div className="mb-6">
                <h3 className="text-[17px] font-bold text-ink">Starter</h3>
                <p className="mt-1 text-[13px] text-muted">For testing and early development</p>
              </div>
              <div className="mb-6">
                <span className="text-[48px] font-extrabold tracking-tight text-ink">$0</span>
                <span className="text-[14px] text-muted font-medium">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['10,000 events per month', 'Unlimited customers', 'REST API access', 'Community support'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" strokeWidth={2.5} />
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full rounded-full border border-line bg-white py-3 text-center text-[14px] font-bold text-ink transition-all hover:bg-canvas hover:shadow-sm" id="pricing-starter-cta">
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-sky-500 bg-gradient-to-b from-sky-50/50 to-white p-8 shadow-xl shadow-sky-200/30">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg shadow-sky-500/25">
                  Recommended
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-[17px] font-bold text-ink">Pro</h3>
                <p className="mt-1 text-[13px] text-muted">For growing businesses</p>
              </div>
              <div className="mb-6">
                <span className="text-[48px] font-extrabold tracking-tight text-ink">$99</span>
                <span className="text-[14px] text-muted font-medium">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['1M events per month', 'Advanced analytics', 'Priority support', 'Team collaboration', 'Custom reports'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500" strokeWidth={2.5} />
                    <span className="text-ink font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-center text-[14px] font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-xl hover:shadow-sky-500/30" id="pricing-pro-cta">
                Start free trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-line bg-white p-8 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <div className="mb-6">
                <h3 className="text-[17px] font-bold text-ink">Enterprise</h3>
                <p className="mt-1 text-[13px] text-muted">For large-scale operations</p>
              </div>
              <div className="mb-6">
                <span className="text-[48px] font-extrabold tracking-tight text-ink">Custom</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['Unlimited events', 'SSO and SAML', 'Dedicated support', 'SLA available', 'Custom integrations'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" strokeWidth={2.5} />
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="block w-full rounded-full border border-line bg-white py-3 text-center text-[14px] font-bold text-ink transition-all hover:bg-canvas hover:shadow-sm" id="pricing-enterprise-cta">
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] py-24 lg:py-32 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 rounded-full blur-[100px]" aria-hidden="true"></div>

        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-[34px] font-extrabold leading-tight tracking-tight text-white sm:text-[48px]">
            Start billing for what your
            <br className="hidden sm:block" />
            product <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">actually delivers</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400 sm:text-[16px]">
            Create an account, integrate the API, and have your first usage event tracked in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-xl shadow-sky-500/25 transition-all hover:shadow-2xl hover:shadow-sky-500/30 sm:w-auto"
              id="final-cta"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/login" className="text-[14px] font-semibold text-slate-400 transition-colors hover:text-white">
              Sign in to existing account
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-line bg-canvas py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-ink to-neutral-700 text-[11px] font-extrabold text-white">L</div>
                <span className="text-[15px] font-bold text-ink">Llah</span>
              </div>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted">
                Metered billing and revenue operations for SaaS, AI, and API businesses.
              </p>
            </div>
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">Product</div>
              <ul className="space-y-2.5">
                <li><a href="#platform" className="text-[13px] text-muted transition-colors hover:text-ink">Platform</a></li>
                <li><a href="#how-it-works" className="text-[13px] text-muted transition-colors hover:text-ink">How it works</a></li>
                <li><a href="#developers" className="text-[13px] text-muted transition-colors hover:text-ink">Developers</a></li>
                <li><a href="#pricing" className="text-[13px] text-muted transition-colors hover:text-ink">Pricing</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">Account</div>
              <ul className="space-y-2.5">
                <li><Link to="/login" className="text-[13px] text-muted transition-colors hover:text-ink">Sign in</Link></li>
                <li><Link to="/register" className="text-[13px] text-muted transition-colors hover:text-ink">Create account</Link></li>
                <li><Link to="/forgot-password" className="text-[13px] text-muted transition-colors hover:text-ink">Reset password</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">Legal</div>
              <ul className="space-y-2.5">
                <li><Link to="/privacy" className="text-[13px] text-muted transition-colors hover:text-ink">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[13px] text-muted transition-colors hover:text-ink">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
            <p className="text-[12px] text-muted">&copy; {new Date().getFullYear()} Llah. All rights reserved.</p>
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
