import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Zap, DollarSign, FileText, BarChart3, Shield, Code2,
  ArrowRight, Check, ChevronRight, Menu, X,
  Activity, Layers, CreditCard, Bell, Key, Lock, GitBranch
} from 'lucide-react';
import HeroScene from '../components/marketing/HeroScene.jsx';
import InfrastructureDiagram from '../components/marketing/InfrastructureDiagram.jsx';
import ApiDemo from '../components/marketing/ApiDemo.jsx';
import BillingLifecycle from '../components/marketing/BillingLifecycle.jsx';

/* ─── Main Landing ─── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const capabilities = [
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
      desc: 'Bill customers based on API calls, storage, compute time, or any custom metric your product tracks.',
      example: 'api_requests, storage_gb, active_users'
    },
    {
      icon: Zap,
      title: 'AI and ML companies',
      desc: 'Meter token usage, model inference calls, or GPU time. Price per unit or in graduated tiers.',
      example: 'tokens_processed, inference_calls, gpu_seconds'
    },
    {
      icon: Layers,
      title: 'API businesses',
      desc: 'Track request volume per endpoint. Apply rate limits and pricing tiers directly to your API usage data.',
      example: 'requests_per_endpoint, bandwidth_mb'
    },
    {
      icon: CreditCard,
      title: 'Infrastructure providers',
      desc: 'Measure resource consumption across services. Consolidate billing for complex multi-product setups.',
      example: 'compute_hours, data_transfer_gb, instances'
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════════════ */}
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

            <div className="hidden items-center gap-6 md:flex">
              <a href="#platform" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Platform</a>
              <a href="#how-it-works" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">How it works</a>
              <a href="#developers" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Developers</a>
              <a href="#pricing" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">Pricing</a>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="rounded-full px-4 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-neutral-100" id="nav-signin">
                Sign in
              </Link>
              <Link to="/register" className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90" id="nav-get-started">
                Get started
              </Link>
            </div>

            <button
              className="flex items-center justify-center rounded p-1.5 text-ink md:hidden"
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
                <a href="#platform" className="rounded px-3 py-2 text-sm text-muted hover:bg-neutral-100 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>Platform</a>
                <a href="#how-it-works" className="rounded px-3 py-2 text-sm text-muted hover:bg-neutral-100 hover:text-ink" onClick={() => setMobileMenuOpen(false)}>How it works</a>
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

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Product Scene
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-canvas">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-[0.35]" aria-hidden="true" style={{
          backgroundImage: 'linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}></div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent" aria-hidden="true"></div>

        <div className="relative mx-auto max-w-7xl px-6 pt-12 lg:px-8 lg:pt-20">
          {/* Text */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-muted shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
              </span>
              NOW IN BETA
            </div>

            <h1 className="text-[40px] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[52px] lg:text-[60px]">
              Metered billing{' '}
              <br className="hidden sm:block" />
              infrastructure for{' '}
              <br className="hidden sm:block" />
              modern software
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
              Track usage events, configure flexible pricing, generate invoices, and manage subscriptions. Llah is the billing layer between your product and revenue.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-ink/90 sm:w-auto"
                id="hero-cta-primary"
              >
                Start building free
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-2.5 text-[14px] font-semibold text-ink shadow-sm transition-all hover:bg-canvas sm:w-auto"
                id="hero-cta-secondary"
              >
                See how it works
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-muted">
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

          {/* Product scene */}
          <div className="mt-12 pb-8 lg:mt-16 lg:pb-12">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PLATFORM CAPABILITIES — Bento Grid
      ═══════════════════════════════════════════════════════════════ */}
      <section id="platform" className="border-t border-line bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Platform</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
              Everything between your product and getting paid
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              From the first usage event to the final invoice line item, Llah provides the complete billing stack for metered and subscription-based pricing.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="group relative bg-white p-8 transition-colors hover:bg-canvas/60" id={`feature-${idx}`}>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas text-ink transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white group-hover:shadow-sm">
                  <cap.icon size={18} strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-ink">{cap.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — Infrastructure Diagram
      ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="border-t border-line bg-canvas py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Architecture</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
              How events become invoices
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Usage events flow through a pipeline of validation, metering, pricing, and invoicing. Each stage is auditable and configurable.
            </p>
          </div>

          <div className="mt-14 overflow-x-auto">
            <InfrastructureDiagram />
          </div>

          {/* Step details below diagram */}
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Key, step: '01', label: 'Ingest events', desc: 'Your application sends usage events to the REST API with idempotency keys for deduplication.' },
              { icon: Activity, step: '02', label: 'Aggregate usage', desc: 'Meters aggregate events using SUM, COUNT, MAX, or LATEST over configurable billing periods.' },
              { icon: DollarSign, step: '03', label: 'Apply pricing', desc: 'Pricing rules calculate charges using flat-rate, per-unit, tiered, volume, or graduated models.' },
              { icon: FileText, step: '04', label: 'Generate invoices', desc: 'Invoices are generated with itemized line items and stored as immutable ledger entries.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-[10px] font-bold tracking-wider text-muted mb-2">{item.step}</div>
                <div className="flex items-center gap-2 mb-2">
                  <item.icon size={15} className="text-ink" strokeWidth={1.5} />
                  <h3 className="text-[14px] font-semibold text-ink">{item.label}</h3>
                </div>
                <p className="text-[13px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DEVELOPER EXPERIENCE — API Demo
      ═══════════════════════════════════════════════════════════════ */}
      <section id="developers" className="border-t border-line bg-ink py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-500">For developers</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-white sm:text-[40px]">
              A REST API you can integrate in an afternoon
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-400">
              Every resource in Llah is accessible through a consistent API. Create customers, define meters, send usage events, and query invoices programmatically.
            </p>
          </div>

          <ApiDemo />

          {/* API features row */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Key, label: 'API key auth', desc: 'Workspace-scoped keys with configurable permissions' },
              { icon: GitBranch, label: 'Idempotent writes', desc: 'Every mutation supports idempotency keys' },
              { icon: Bell, label: 'Webhooks', desc: 'Outbound events for billing lifecycle changes' },
              { icon: Lock, label: 'Audit trail', desc: 'Every API call is logged with full context' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800">
                  <item.icon size={13} className="text-neutral-300" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">{item.label}</div>
                  <div className="text-[12px] text-neutral-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BILLING LIFECYCLE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-line bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Lifecycle</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
              Every billing event, tracked from start to finish
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Subscriptions move through a clear lifecycle. Each state transition is recorded in the ledger with full audit context.
            </p>
          </div>

          <div className="mt-14">
            <BillingLifecycle />
          </div>

          {/* Detail cards below lifecycle */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {[
              { title: 'Subscriptions', desc: 'Create, update, pause, and cancel subscriptions. Attach plans with multiple pricing components.', items: ['Plan management', 'Proration support', 'Status tracking'] },
              { title: 'Credits and adjustments', desc: 'Issue credits, apply adjustments, and process refunds. Every modification creates an immutable ledger entry.', items: ['Credit balance', 'Line-item adjustments', 'Refund processing'] },
              { title: 'Coupons and discounts', desc: 'Create percentage or fixed-amount coupons. Apply to subscriptions or individual invoices with configurable limits.', items: ['Percentage coupons', 'Fixed-amount coupons', 'Usage limits'] },
            ].map((card, i) => (
              <div key={i} className="bg-white p-6">
                <h3 className="text-[14px] font-semibold text-ink">{card.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{card.desc}</p>
                <ul className="mt-3 space-y-1.5">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-[12px]">
                      <Check className="h-3 w-3 text-success flex-shrink-0" strokeWidth={3} />
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          USE CASES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-line bg-canvas py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Use cases</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
              Built for businesses that bill on usage
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Whether you charge per API call, per token, per seat, or per gigabyte, Llah supports the pricing model your business needs.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {audiences.map((aud, i) => (
              <div key={i} className="group rounded-2xl border border-line bg-white p-7 transition-all hover:border-neutral-300 hover:shadow-sm" id={`usecase-${i}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-line bg-canvas transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                    <aud.icon size={18} className="text-ink group-hover:text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-ink">{aud.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{aud.desc}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1">
                      <Activity size={10} className="text-muted" />
                      <span className="text-[10px] font-mono text-muted">{aud.example}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECURITY AND TRUST
      ═══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-line bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: text */}
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Security</div>
              <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">
                Financial-grade data handling
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Llah stores monetary values in integer minor units with deterministic arithmetic. Ledger entries are append-only. Every data mutation is recorded in the audit trail.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Lock, title: 'Append-only ledger', desc: 'Financial records are immutable. Corrections use adjustments, credits, and refunds with full traceability.' },
                  { icon: Shield, title: 'Role-based access', desc: 'Workspace members have scoped permissions. API keys are tied to workspaces with configurable access levels.' },
                  { icon: Activity, title: 'Audit logging', desc: 'Every action is recorded. Sessions are tracked and revocable. Sensitive operations require authentication.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-line bg-canvas">
                      <item.icon size={16} className="text-ink" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-ink">{item.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Ledger preview */}
            <div className="rounded-2xl border border-line bg-canvas p-1.5">
              <div className="rounded-xl border border-line bg-white overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-canvas/50">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-muted" />
                    <span className="text-[12px] font-semibold text-ink">Ledger Entries</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">INV-2024-0047</span>
                </div>
                <div className="divide-y divide-line">
                  {[
                    { type: 'CHARGE', desc: 'API Requests (Tier 1: 0-50k)', qty: '50,000', amount: '+$500.00', color: 'text-ink' },
                    { type: 'CHARGE', desc: 'API Requests (Tier 2: 50k-150k)', qty: '84,000', amount: '+$1,260.00', color: 'text-ink' },
                    { type: 'CHARGE', desc: 'Storage (per GB)', qty: '580 GB', amount: '+$580.00', color: 'text-ink' },
                    { type: 'CREDIT', desc: 'Volume discount', qty: '', amount: '-$120.00', color: 'text-success' },
                    { type: 'TAX', desc: 'Sales tax (8.875%)', qty: '', amount: '+$197.03', color: 'text-muted' },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                      <span className={`text-[9px] font-bold tracking-wider w-[52px] ${entry.type === 'CREDIT' ? 'text-success' : entry.type === 'TAX' ? 'text-muted' : 'text-brand-600'}`}>
                        {entry.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] text-ink">{entry.desc}</span>
                        {entry.qty && <span className="text-[10px] text-muted ml-2">{entry.qty}</span>}
                      </div>
                      <span className={`text-[12px] font-mono font-medium ${entry.color}`}>{entry.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-ink/10 px-5 py-3 flex items-center justify-between bg-canvas/30">
                  <span className="text-[12px] font-semibold text-ink">Total</span>
                  <span className="text-[14px] font-bold font-mono text-ink">$2,417.03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="border-t border-line bg-canvas py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">Pricing</div>
            <h2 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
              Start free, scale when ready
            </h2>
            <p className="mt-4 text-[15px] text-muted">
              No credit card required. Upgrade as your usage grows.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {/* Starter */}
            <div className="rounded-2xl border border-line bg-white p-8 transition-all hover:shadow-sm">
              <div className="mb-6">
                <h3 className="text-[16px] font-semibold text-ink">Starter</h3>
                <p className="mt-1 text-[13px] text-muted">For testing and early development</p>
              </div>
              <div className="mb-6">
                <span className="text-[44px] font-bold tracking-tight text-ink">$0</span>
                <span className="text-[13px] text-muted">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['10,000 events per month', 'Unlimited customers', 'REST API access', 'Community support'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" strokeWidth={2.5} />
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full rounded-full border border-line bg-white py-2.5 text-center text-[13px] font-semibold text-ink transition-all hover:bg-canvas" id="pricing-starter-cta">
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-ink bg-white p-8 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-ink px-3.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase">Recommended</span>
              </div>
              <div className="mb-6">
                <h3 className="text-[16px] font-semibold text-ink">Pro</h3>
                <p className="mt-1 text-[13px] text-muted">For growing businesses</p>
              </div>
              <div className="mb-6">
                <span className="text-[44px] font-bold tracking-tight text-ink">$99</span>
                <span className="text-[13px] text-muted">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['1M events per month', 'Advanced analytics', 'Priority support', 'Team collaboration', 'Custom reports'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ink" strokeWidth={2.5} />
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full rounded-full bg-ink py-2.5 text-center text-[13px] font-semibold text-white transition-all hover:bg-ink/90" id="pricing-pro-cta">
                Start free trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-line bg-white p-8 transition-all hover:shadow-sm">
              <div className="mb-6">
                <h3 className="text-[16px] font-semibold text-ink">Enterprise</h3>
                <p className="mt-1 text-[13px] text-muted">For large-scale operations</p>
              </div>
              <div className="mb-6">
                <span className="text-[44px] font-bold tracking-tight text-ink">Custom</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['Unlimited events', 'SSO and SAML', 'Dedicated support', 'SLA available', 'Custom integrations'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" strokeWidth={2.5} />
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="block w-full rounded-full border border-line bg-white py-2.5 text-center text-[13px] font-semibold text-ink transition-all hover:bg-canvas" id="pricing-enterprise-cta">
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-line bg-ink py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-[32px] font-bold leading-tight tracking-tight text-white sm:text-[44px]">
            Start billing for what your product actually delivers
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-neutral-400">
            Create an account, integrate the API, and have your first usage event tracked in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-[14px] font-semibold text-ink shadow-sm transition-all hover:bg-neutral-100 sm:w-auto"
              id="final-cta"
            >
              Create free account
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="text-[14px] font-semibold text-neutral-400 transition-colors hover:text-white"
            >
              Sign in to existing account
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-line bg-canvas py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">L</div>
                <span className="text-[13px] font-semibold text-ink">Llah</span>
              </div>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted">
                Metered billing and revenue operations for SaaS, AI, and API businesses.
              </p>
            </div>
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Product</div>
              <ul className="space-y-2.5">
                <li><a href="#platform" className="text-[13px] text-muted transition-colors hover:text-ink">Platform</a></li>
                <li><a href="#how-it-works" className="text-[13px] text-muted transition-colors hover:text-ink">How it works</a></li>
                <li><a href="#developers" className="text-[13px] text-muted transition-colors hover:text-ink">Developers</a></li>
                <li><a href="#pricing" className="text-[13px] text-muted transition-colors hover:text-ink">Pricing</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Account</div>
              <ul className="space-y-2.5">
                <li><Link to="/login" className="text-[13px] text-muted transition-colors hover:text-ink">Sign in</Link></li>
                <li><Link to="/register" className="text-[13px] text-muted transition-colors hover:text-ink">Create account</Link></li>
                <li><Link to="/forgot-password" className="text-[13px] text-muted transition-colors hover:text-ink">Reset password</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Legal</div>
              <ul className="space-y-2.5">
                <li><Link to="/privacy" className="text-[13px] text-muted transition-colors hover:text-ink">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[13px] text-muted transition-colors hover:text-ink">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
            <p className="text-[12px] text-muted">&copy; {new Date().getFullYear()} Llah. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
