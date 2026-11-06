import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Menu, X, Activity, FileText, CreditCard, Code2, Gauge, Webhook,
  Layers, Bell, Shield, Users, Percent, Wallet,
} from 'lucide-react';
import HeroScene from '../components/marketing/HeroScene.jsx';

const NAV = [
  { href: '#products', label: 'Products' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#developers', label: 'Developers' },
  { href: '#platform', label: 'Platform' },
];

function Mark({ light = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-semibold ${light ? 'bg-white text-[#0a2540]' : 'bg-[#0a2540] text-white'}`}>L</span>
      <span className={`text-[15px] font-semibold tracking-tight ${light ? 'text-white' : 'text-[#0a2540]'}`}>Llah</span>
    </span>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0a2540]">
      <header className={`sticky top-0 z-50 transition-colors ${scrolled ? 'border-b border-[#e3e8ee] bg-white/90 backdrop-blur' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" id="nav-logo" aria-label="Llah home"><Mark /></Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map(item => (
              <a key={item.href} href={item.href} className="text-[14px] text-[#425466] hover:text-[#0a2540]">{item.label}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" id="nav-signin" className="rounded-full px-3 py-2 text-[14px] font-medium text-[#0a2540] hover:bg-[#f6f9fc]">Sign in</Link>
            <Link to="/register" id="nav-get-started" className="rounded-full bg-[#3d4ed7] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#3140c4]">Start now</Link>
          </div>
          <button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="Open menu" id="nav-mobile-toggle">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="border-t border-[#e3e8ee] bg-white px-5 py-3 md:hidden">
            {NAV.map(item => (
              <a key={item.href} href={item.href} className="block py-2 text-sm text-[#425466]" onClick={() => setOpen(false)}>{item.label}</a>
            ))}
            <Link to="/login" className="mt-2 block py-2 text-sm font-medium">Sign in</Link>
            <Link to="/register" className="mt-1 block rounded-full bg-[#3d4ed7] py-2 text-center text-sm font-medium text-white">Start now</Link>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-[#c7d2fe] opacity-70 blur-3xl" />
          <div className="absolute right-[-80px] top-0 h-[480px] w-[520px] rounded-full bg-[#f8c9b0] opacity-80 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#d7f3ee] opacity-80 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 text-center sm:pt-24">
          <h1 className="mx-auto max-w-4xl text-[44px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[68px]">
            Billing infrastructure for software that charges on usage
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-7 text-[#425466]">
            Llah records usage, prices it, and turns it into invoices, payments, and revenue for the workspace you already run.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link id="hero-cta-primary" to="/register" className="inline-flex items-center gap-2 rounded-full bg-[#0a2540] px-6 py-3 text-[15px] font-medium text-white hover:bg-[#16324f]">
              Create a workspace <ArrowRight size={16} />
            </Link>
            <a id="hero-cta-secondary" href="#products" className="inline-flex items-center rounded-full border border-[#e3e8ee] bg-white px-6 py-3 text-[15px] font-medium text-[#0a2540] hover:bg-[#f6f9fc]">
              See the product
            </a>
          </div>
        </div>
        <div className="relative mx-auto max-w-5xl px-5 pb-20">
          <HeroScene />
        </div>
      </section>

      <section id="products" className="border-t border-[#e3e8ee] bg-[#f6f9fc] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-xl text-[36px] font-semibold leading-tight tracking-tight">One workspace for the billing loop</h2>
          <p className="mt-3 max-w-xl text-[16px] text-[#425466]">Each piece talks to the same customers, meters, and ledger. Nothing here is a separate product you have to stitch together.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: Gauge, title: 'Usage', body: 'Ingest events with idempotency keys, then aggregate them by meter and customer.' },
              { icon: FileText, title: 'Invoices', body: 'Close a billing period and produce an invoice from the usage and prices already on the account.' },
              { icon: CreditCard, title: 'Payments', body: 'Track what was collected, what failed, and what was refunded against those invoices.' },
              { icon: Activity, title: 'Subscriptions', body: 'Attach a plan to a customer and keep the current period, status, and items in one place.' },
              { icon: Code2, title: 'API keys', body: 'Issue workspace keys for the same REST API the dashboard uses.' },
              { icon: Webhook, title: 'Webhooks', body: 'Send signed deliveries when billing events happen, and see whether they succeeded.' },
            ].map(item => (
              <article key={item.title} className="rounded-2xl border border-[#e3e8ee] bg-white p-6">
                <item.icon size={20} strokeWidth={1.75} className="text-[#3d4ed7]" />
                <h3 className="mt-4 text-[17px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#425466]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 lg:grid-cols-2">
          <article className="overflow-hidden rounded-3xl bg-[#0a2540] p-8 text-white lg:p-10">
            <p className="text-[13px] font-medium text-[#9aadc2]">Billing</p>
            <h2 className="mt-3 max-w-md text-[32px] font-semibold leading-tight tracking-tight">Plans, periods, and invoices in one pass</h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#c5d0de]">
              Put a customer on a plan. When the period ends, Llah aggregates the meters on that plan and writes the invoice from those totals.
            </p>
            <ul className="mt-8 space-y-3 text-[14px] text-[#d6e2f0]">
              {['Flat, per-unit, and tiered prices', 'Draft, open, paid, and void invoices', 'Credits, coupons, tax, and adjustments on the same bill'].map(line => (
                <li key={line} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b97f0]" />{line}</li>
              ))}
            </ul>
          </article>
          <article className="overflow-hidden rounded-3xl border border-[#e3e8ee] bg-white p-8 lg:p-10">
            <p className="text-[13px] font-medium text-[#3d4ed7]">Revenue</p>
            <h2 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight">See what the ledger already knows</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#425466]">
              Recurring revenue, open invoices, and failed payments are read from the same records the billing pages use. There is no second set of numbers.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ['MRR', 'From active subscriptions'],
                ['Invoices', 'Open, paid, and void'],
                ['Payments', 'Succeeded and failed'],
                ['Reports', 'Generated from the workspace'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-xl bg-[#f6f9fc] px-4 py-3">
                  <div className="text-[14px] font-semibold">{title}</div>
                  <div className="mt-1 text-[12px] leading-5 text-[#6b7c93]">{body}</div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="solutions" className="border-t border-[#e3e8ee] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-xl text-[36px] font-semibold leading-tight tracking-tight">Built for teams that meter what they sell</h2>
          <p className="mt-3 max-w-2xl text-[16px] text-[#425466]">The meter is yours. Llah only needs a customer, a quantity, and the price you already configured.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { title: 'SaaS', body: 'Bill seats, workspaces, or feature usage. Subscriptions keep the plan, and meters catch anything that is not a flat fee.' },
              { title: 'AI products', body: 'Count tokens, generations, or minutes. Price the first block one way and the rest another with tiers.' },
              { title: 'APIs', body: 'Each request can be a usage event. Idempotency keys stop a retry from billing the same call twice.' },
            ].map(item => (
              <article key={item.title} className="rounded-2xl bg-[#f6f9fc] p-6">
                <h3 className="text-[18px] font-semibold">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-6 text-[#425466]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="developers" className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#3d4ed7]">Developers</p>
            <h2 className="mt-3 text-[36px] font-semibold leading-tight tracking-tight">Send a usage event. The rest of the ledger follows.</h2>
            <p className="mt-4 text-[16px] leading-7 text-[#425466]">
              The API accepts a customer, a meter, a quantity, and an idempotency key. Replay the same key and Llah returns the original event instead of billing it twice.
            </p>
            <Link to="/register" className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-[#3d4ed7]">
              Get an API key <ArrowRight size={16} />
            </Link>
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-[#0a2540] p-6 text-[13px] leading-6 text-[#d6e2f0]">{`POST /v1/usage-events
Authorization: Bearer llah_live_...

{
  "idempotencyKey": "evt_2048",
  "customerId": "cus_...",
  "meterId": "mtr_...",
  "quantity": 1200
}`}</pre>
        </div>
      </section>

      <section id="platform" className="border-t border-[#e3e8ee] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-[36px] font-semibold tracking-tight">How a period closes</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              ['01', 'Meter', 'Define the unit you sell: requests, tokens, seats, or anything else you count.'],
              ['02', 'Price', 'Attach a flat, per-unit, or tiered price to a product and a plan.'],
              ['03', 'Subscribe', 'Put a customer on that plan so usage lands on the right account.'],
              ['04', 'Invoice', 'Close the period. The invoice, payment, and revenue views read the same records.'],
            ].map(([n, title, body]) => (
              <li key={n}>
                <div className="text-[13px] font-medium text-[#8898aa]">{n}</div>
                <h3 className="mt-2 text-[18px] font-semibold">{title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#425466]">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f6f9fc] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-lg text-[36px] font-semibold leading-tight tracking-tight">The rest of the workspace</h2>
          <p className="mt-3 max-w-xl text-[16px] text-[#425466]">Billing sits next to the tools you use to run the account. Same sign-in, same organization.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Team', body: 'Invite people into the organization and keep membership on the workspace.' },
              { icon: Shield, title: 'Audit log', body: 'Sensitive changes are recorded so you can see who did what.' },
              { icon: Wallet, title: 'Credits and refunds', body: 'Apply a credit or refund against a real invoice or payment.' },
              { icon: Percent, title: 'Tax and coupons', body: 'Rates and coupon codes are stored with the organization, then used when a bill is built.' },
              { icon: Bell, title: 'Alerts', body: 'Watch for conditions you set, such as failed payments, and keep the notification in the workspace.' },
              { icon: Layers, title: 'Jobs', body: 'Background work, including report generation, shows its status instead of disappearing.' },
            ].map(item => (
              <article key={item.title} className="rounded-2xl border border-[#e3e8ee] bg-white p-5">
                <item.icon size={18} strokeWidth={1.75} className="text-[#3d4ed7]" />
                <h3 className="mt-3 text-[16px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#425466]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-[32px] font-semibold tracking-tight">A bill you can read back</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#425466]">
              Charges, credits, and tax stay as separate lines. Corrections are new entries, so an earlier invoice does not get rewritten in place.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e3e8ee] bg-white">
            <div className="flex items-center justify-between border-b border-[#e3e8ee] px-5 py-3">
              <span className="text-[13px] font-medium">Example invoice lines</span>
              <span className="text-[12px] text-[#8898aa]">Sample layout</span>
            </div>
            {[
              ['Usage', 'API requests, tier 1', 'Charge'],
              ['Usage', 'API requests, tier 2', 'Charge'],
              ['Credit', 'Applied balance', 'Credit'],
              ['Tax', 'Configured rate', 'Tax'],
            ].map(([kind, label, tag]) => (
              <div key={label} className="flex items-center justify-between border-b border-[#e3e8ee] px-5 py-3 last:border-0">
                <div>
                  <div className="text-[14px] font-medium">{label}</div>
                  <div className="text-[12px] text-[#8898aa]">{kind}</div>
                </div>
                <span className="rounded-full bg-[#f6f9fc] px-2 py-0.5 text-[11px] font-medium text-[#425466]">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a2540] py-20 text-white">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-[40px] font-semibold tracking-tight">Open a workspace and send the first event</h2>
          <p className="mt-4 text-[16px] text-[#c5d0de]">Same account on the web and in the Llah app.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link id="final-cta" to="/register" className="rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[#0a2540]">Create a workspace</Link>
            <Link to="/login" className="rounded-full px-6 py-3 text-[15px] text-white hover:bg-white/10">Sign in</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e3e8ee] bg-[#f6f9fc] py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-4">
          <div>
            <Mark />
            <p className="mt-3 max-w-xs text-[13px] leading-6 text-[#425466]">Usage, invoices, and revenue for one workspace.</p>
          </div>
          <div>
            <div className="text-[12px] font-medium uppercase tracking-wider text-[#8898aa]">Product</div>
            <ul className="mt-3 space-y-2 text-[14px] text-[#425466]">
              <li><a href="#products" className="hover:text-[#0a2540]">Usage and billing</a></li>
              <li><a href="#products" className="hover:text-[#0a2540]">Invoices</a></li>
              <li><a href="#products" className="hover:text-[#0a2540]">Payments</a></li>
              <li><a href="#solutions" className="hover:text-[#0a2540]">Solutions</a></li>
              <li><a href="#platform" className="hover:text-[#0a2540]">Platform</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[12px] font-medium uppercase tracking-wider text-[#8898aa]">Account</div>
            <ul className="mt-3 space-y-2 text-[14px] text-[#425466]">
              <li><Link to="/login" className="hover:text-[#0a2540]">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-[#0a2540]">Create account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-[#0a2540]">Reset password</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[12px] font-medium uppercase tracking-wider text-[#8898aa]">Legal</div>
            <ul className="mt-3 space-y-2 text-[14px] text-[#425466]">
              <li><Link to="/privacy" className="hover:text-[#0a2540]">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-[#0a2540]">Terms</Link></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-5 text-[12px] text-[#8898aa]">© {new Date().getFullYear()} Llah</p>
      </footer>
    </div>
  );
}
