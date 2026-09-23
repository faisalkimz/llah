import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Animated Code Block Component
function AnimatedCode({ lines = [], delay = 50 }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (!lines || lines.length === 0) return;
    
    // Reset when lines change
    setDisplayedLines([]);
    setIsComplete(false);
    
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setDisplayedLines(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, delay * 10);
    
    return () => clearInterval(interval);
  }, [lines, delay]);
  
  return (
    <div className="rounded-lg border border-line bg-[#1e1e1e] p-4 font-mono text-sm">
      {displayedLines.map((line, idx) => (
        <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
          {line?.type === 'comment' && <span className="text-[#6a9955]">{line.text}</span>}
          {line?.type === 'code' && (
            <span>
              <span className="text-[#569cd6]">{line.keyword}</span>
              <span className="text-[#dcdcaa]">{line.method}</span>
              <span className="text-[#d4d4d4]">{line.rest}</span>
            </span>
          )}
        </div>
      ))}
      {!isComplete && <span className="inline-block h-4 w-2 animate-pulse bg-white"></span>}
    </div>
  );
}

// Live Metrics Component
function LiveMetrics() {
  const [metrics, setMetrics] = useState({
    events: 1247891,
    revenue: 124450,
    customers: 2847
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        events: prev.events + Math.floor(Math.random() * 100),
        revenue: prev.revenue + Math.floor(Math.random() * 50),
        customers: prev.customers + (Math.random() > 0.95 ? 1 : 0)
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border border-line bg-white p-4">
        <div className="text-xs font-medium text-muted">Events/sec</div>
        <div className="mt-1 text-2xl font-bold text-ink transition-all duration-300">
          {metrics.events.toLocaleString()}
        </div>
        <div className="mt-1 text-xs text-success">↑ Live</div>
      </div>
      <div className="rounded-lg border border-line bg-white p-4">
        <div className="text-xs font-medium text-muted">Revenue</div>
        <div className="mt-1 text-2xl font-bold text-ink transition-all duration-300">
          ${metrics.revenue.toLocaleString()}
        </div>
        <div className="mt-1 text-xs text-success">↑ 12.5%</div>
      </div>
      <div className="rounded-lg border border-line bg-white p-4">
        <div className="text-xs font-medium text-muted">Customers</div>
        <div className="mt-1 text-2xl font-bold text-ink transition-all duration-300">
          {metrics.customers.toLocaleString()}
        </div>
        <div className="mt-1 text-xs text-success">↑ 8.2%</div>
      </div>
    </div>
  );
}

// Animated Graph Component
function AnimatedGraph() {
  const [bars, setBars] = useState([40, 60, 45, 75, 55, 85, 70, 90, 80, 95, 88, 100]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(h => Math.max(20, Math.min(100, h + (Math.random() - 0.5) * 10))));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex h-48 w-full items-end gap-2 rounded-lg bg-white p-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all duration-1000 ease-in-out"
          style={{ 
            height: `${height}%`,
            background: 'linear-gradient(to top, #0284c7, #0ea5e9)'
          }}
        ></div>
      ))}
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const codeExample = [
    { type: 'comment', text: '// Track usage events in real-time' },
    { type: 'code', keyword: 'await ', method: 'llah.events.', rest: 'create({' },
    { type: 'code', keyword: '  ', method: 'customer_id', rest: ': "cus_abc123",' },
    { type: 'code', keyword: '  ', method: 'event_name', rest: ': "api_call",' },
    { type: 'code', keyword: '  ', method: 'value', rest: ': 1,' },
    { type: 'code', keyword: '  ', method: 'timestamp', rest: ': Date.now()' },
    { type: 'code', keyword: '', method: '});', rest: '' },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Navigation - Sticky with blur */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        scrolled ? 'border-line bg-canvas/80 backdrop-blur-xl' : 'border-transparent bg-canvas'
      }`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">
                L
              </div>
              <span className="text-sm font-semibold tracking-tight text-ink">Llah</span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
                Features
              </a>
              <a href="#pricing" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
                Pricing
              </a>
              <a href="#customers" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
                Customers
              </a>
              <a href="#docs" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
                Docs
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded bg-ink px-3 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Grid Background */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-40"></div>
        
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge with pulse */}
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-muted shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
              </span>
              NOW IN PUBLIC BETA
            </div>

            {/* Main Headline - Larger, bolder */}
            <h1 className="animate-fade-up text-[56px] font-bold leading-[1.05] tracking-[-0.04em] text-ink lg:text-[72px]" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              Infrastructure for
              <br />
              modern monetization
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              Usage-based billing for AI, API, and SaaS. Track usage in real-time, price flexibly, and automate revenue operations—all in one platform.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-up mt-10 flex items-center justify-center gap-3" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-ink/90 hover:shadow-md"
              >
                Start building free
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-5 py-2.5 text-[14px] font-semibold text-ink shadow-sm transition-all hover:bg-canvas hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch demo
              </a>
            </div>

            {/* Trust signals */}
            <div className="animate-fade-up mt-10 flex items-center justify-center gap-6 text-[12px] text-muted" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Free to start
              </div>
              <div className="h-3 w-px bg-line"></div>
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                No credit card
              </div>
              <div className="h-3 w-px bg-line"></div>
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                14-day trial
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="animate-fade-up mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
            <div className="rounded-lg border border-line bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="text-[32px] font-bold tracking-tight text-ink">$2.4B+</div>
              <div className="mt-1 text-[13px] text-muted">Revenue processed</div>
            </div>
            <div className="rounded-lg border border-line bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="text-[32px] font-bold tracking-tight text-ink">1.2B+</div>
              <div className="mt-1 text-[13px] text-muted">Events per day</div>
            </div>
            <div className="rounded-lg border border-line bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="text-[32px] font-bold tracking-tight text-ink">99.99%</div>
              <div className="mt-1 text-[13px] text-muted">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section - NEW */}
      <section className="border-b border-line bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-brand-600">LIVE DEMO</div>
            <h2 className="text-[40px] font-bold leading-tight tracking-tight text-ink">
              See it in action
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Real-time metering, automated invoicing, and revenue analytics—all working together.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* Code Example */}
            <div>
              <div className="mb-4 text-[14px] font-semibold text-ink">Track usage with one API call</div>
              <AnimatedCode lines={codeExample} />
              <div className="mt-4 flex items-center gap-2 text-[12px] text-muted">
                <div className="flex h-2 w-2 animate-pulse rounded-full bg-success"></div>
                Event ingested in 23ms
              </div>
            </div>

            {/* Live Dashboard */}
            <div>
              <div className="mb-4 text-[14px] font-semibold text-ink">Watch metrics update live</div>
              <LiveMetrics />
              <div className="mt-4">
                <div className="rounded-lg border border-line bg-canvas p-4">
                  <div className="mb-3 text-[12px] font-medium text-muted">Revenue over time</div>
                  <AnimatedGraph />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Customer Logos */}
      <section id="customers" className="border-b border-line bg-canvas py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-[12px] font-medium uppercase tracking-wider text-muted">
            TRUSTED BY MODERN SAAS COMPANIES
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            {['OpenAI', 'Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'].map((company) => (
              <div key={company} className="text-[18px] font-bold text-ink transition-transform hover:scale-110">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section id="features" className="border-b border-line bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-brand-600">PLATFORM</div>
            <h2 className="text-[40px] font-bold leading-tight tracking-tight text-ink">
              Ship pricing as fast as you ship product
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              From metering to invoicing, we handle the complexity so you can focus on building.
            </p>
          </div>

          {/* Feature Grid - 2x3 */}
          <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Real-time metering',
                description: 'Ingest millions of events per second with guaranteed accuracy and idempotency.'
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Flexible pricing models',
                description: 'Support flat, per-unit, tiered, volume, and graduated pricing. Mix and match.'
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Automated invoicing',
                description: 'Generate and send invoices automatically. Customizable templates and schedules.'
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Revenue analytics',
                description: 'Track MRR, ARR, churn, and cohorts in real-time with exportable reports.'
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Enterprise security',
                description: 'SOC 2 compliant. Role-based access, audit logs, SSO, and encryption.'
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                title: 'Developer APIs',
                description: 'RESTful APIs, webhooks, SDKs, and docs. Built for developers, by developers.'
              },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white p-8 transition-all hover:bg-canvas">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-canvas text-ink transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-[15px] font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="border-b border-line bg-canvas py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="rounded-xl border border-line bg-white p-10 shadow-sm lg:p-12">
            <div className="mb-6 text-[28px] font-medium leading-snug text-ink">
              "Llah allows us to monitor credit usage, track customer health in real-time, and drive upsells at the right time—ensuring our customers get the most value while avoiding overages."
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                P
              </div>
              <div>
                <div className="text-[14px] font-semibold text-ink">Peter Welinder</div>
                <div className="text-[13px] text-muted">VP of Product, OpenAI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Minimal */}
      <section id="pricing" className="border-b border-line bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-brand-600">PRICING</div>
            <h2 className="text-[40px] font-bold leading-tight tracking-tight text-ink">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-[16px] text-muted">
              Start free, scale as you grow. No hidden fees, ever.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {/* Starter */}
            <div className="rounded-xl border border-line bg-white p-8 transition-all hover:shadow-lg">
              <div className="mb-6">
                <h3 className="text-[16px] font-semibold text-ink">Starter</h3>
                <p className="mt-1 text-[13px] text-muted">For testing and MVPs</p>
              </div>
              <div className="mb-8">
                <span className="text-[48px] font-bold tracking-tight text-ink">$0</span>
                <span className="text-[14px] text-muted">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['10K events/month', 'Unlimited customers', 'API access', 'Community support'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px]">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full rounded-md border border-line bg-white py-2.5 text-center text-[14px] font-semibold text-ink transition-all hover:bg-canvas hover:shadow-sm"
              >
                Get started
              </Link>
            </div>

            {/* Pro - Highlighted */}
            <div className="relative rounded-xl border-2 border-ink bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-[16px] font-semibold text-ink">Pro</h3>
                <p className="mt-1 text-[13px] text-muted">For growing companies</p>
              </div>
              <div className="mb-8">
                <span className="text-[48px] font-bold tracking-tight text-ink">$99</span>
                <span className="text-[14px] text-muted">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['1M events/month', 'Advanced analytics', 'Priority support', 'Team collaboration', 'Custom reports'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px]">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full rounded-md bg-ink py-2.5 text-center text-[14px] font-semibold text-white transition-all hover:bg-ink/90 hover:shadow-lg"
              >
                Start free trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl border border-line bg-white p-8 transition-all hover:shadow-lg">
              <div className="mb-6">
                <h3 className="text-[16px] font-semibold text-ink">Enterprise</h3>
                <p className="mt-1 text-[13px] text-muted">Custom solutions</p>
              </div>
              <div className="mb-8">
                <span className="text-[48px] font-bold tracking-tight text-ink">Custom</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['Unlimited events', 'SSO & SAML', 'Dedicated support', 'SLA guarantee', 'Custom integrations'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px]">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="block w-full rounded-md border border-line bg-white py-2.5 text-center text-[14px] font-semibold text-ink transition-all hover:bg-canvas hover:shadow-sm">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-b border-line bg-canvas py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-[44px] font-bold leading-tight tracking-tight text-ink">
            Ready to modernize your billing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] text-muted">
            Join thousands of companies using Llah to power their usage-based billing.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-ink/90 hover:shadow-md"
            >
              Start building for free
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#docs" className="text-[14px] font-semibold text-ink transition-opacity hover:opacity-70">
              View documentation →
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">
                L
              </div>
              <span className="text-[13px] font-semibold text-ink">Llah</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[13px] text-muted transition-colors hover:text-ink">Twitter</a>
              <a href="#" className="text-[13px] text-muted transition-colors hover:text-ink">GitHub</a>
              <a href="#" className="text-[13px] text-muted transition-colors hover:text-ink">Docs</a>
            </div>
            <p className="text-[12px] text-muted">© 2026 Llah. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
