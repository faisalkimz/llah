import { useState, useEffect } from 'react';

/**
 * Hero Scene: A layered product composition showing Llah's core interfaces.
 * Built from real product patterns: dashboard stats, invoice detail, event timeline.
 */
export default function HeroScene() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const base = 'transition-all duration-700 ease-out';
  const show = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

  return (
    <div className="relative mx-auto w-full max-w-[900px]" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {/* Composition wrapper with perspective */}
      <div className="relative" style={{ perspective: '1200px' }}>

        {/* ─── Layer 1: Dashboard Preview (back, slightly rotated) ─── */}
        <div
          className={`${base} ${show} rounded-xl border border-line bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden`}
          style={{ transitionDelay: '100ms', transform: visible ? 'rotateX(2deg)' : 'rotateX(4deg) translateY(8px)' }}
        >
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-ink flex items-center justify-center text-[8px] font-bold text-white">L</div>
              <span className="text-[12px] font-semibold text-ink">Dashboard</span>
              <span className="text-[10px] text-muted ml-1">/ Overview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-neutral-200"></div>
              <div className="h-2 w-2 rounded-full bg-neutral-200"></div>
              <div className="h-2 w-2 rounded-full bg-neutral-200"></div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-px bg-line">
            {[
              { label: 'Active Subscriptions', value: '24' },
              { label: 'Open Invoices', value: '7' },
              { label: 'Total Customers', value: '156' },
              { label: 'Events Today', value: '12,847' },
            ].map((stat, i) => (
              <div key={i} className="bg-white px-4 py-4">
                <div className="text-[10px] font-medium text-muted mb-1">{stat.label}</div>
                <div className="text-[22px] font-bold tracking-tight text-ink leading-none">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Recent invoices table */}
          <div className="px-5 py-3 border-t border-line">
            <div className="text-[11px] font-semibold text-ink mb-2">Recent Invoices</div>
            <div className="space-y-0">
              {[
                { id: 'INV-2024-0047', customer: 'Acme Corp', amount: '$2,340.00', status: 'PAID', statusColor: 'bg-green-100 text-green-700' },
                { id: 'INV-2024-0046', customer: 'TechStart Inc', amount: '$890.50', status: 'OPEN', statusColor: 'bg-blue-100 text-blue-700' },
                { id: 'INV-2024-0045', customer: 'DataFlow Labs', amount: '$1,567.00', status: 'DRAFT', statusColor: 'bg-neutral-100 text-neutral-600' },
              ].map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-line/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted w-[100px]">{inv.id}</span>
                    <span className="text-[11px] text-ink">{inv.customer}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-ink">{inv.amount}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${inv.statusColor}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Layer 2: Invoice Detail Card (floating, overlapping) ─── */}
        <div
          className={`${base} ${show} absolute -bottom-8 -right-4 w-[280px] rounded-xl border border-line bg-white shadow-[0_12px_48px_rgba(0,0,0,0.1)] overflow-hidden hidden md:block`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="px-4 py-3 border-b border-line bg-canvas/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink">Invoice Detail</span>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700">PAID</span>
            </div>
            <div className="text-[10px] font-mono text-muted mt-0.5">INV-2024-0047</div>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted">Customer</span>
              <span className="text-ink font-medium">Acme Corp</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted">Period</span>
              <span className="text-ink">Oct 1 - Oct 31</span>
            </div>
            <div className="border-t border-line pt-2 mt-2">
              <div className="text-[9px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Line Items</div>
              {[
                { desc: 'API Requests (tier 1)', qty: '50,000', total: '$500.00' },
                { desc: 'API Requests (tier 2)', qty: '84,000', total: '$1,260.00' },
                { desc: 'Storage (GB)', qty: '580', total: '$580.00' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1 text-[10px]">
                  <div>
                    <span className="text-ink">{item.desc}</span>
                    <span className="text-muted ml-1">x {item.qty}</span>
                  </div>
                  <span className="text-ink font-medium">{item.total}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line pt-2 flex justify-between text-[11px] font-semibold">
              <span className="text-ink">Total</span>
              <span className="text-ink">$2,340.00</span>
            </div>
          </div>
        </div>

        {/* ─── Layer 3: Event Timeline (floating left) ─── */}
        <div
          className={`${base} ${show} absolute -bottom-4 -left-4 w-[220px] rounded-xl border border-line bg-white shadow-[0_12px_48px_rgba(0,0,0,0.1)] overflow-hidden hidden lg:block`}
          style={{ transitionDelay: '600ms' }}
        >
          <div className="px-4 py-2.5 border-b border-line bg-canvas/50">
            <span className="text-[11px] font-semibold text-ink">Event Stream</span>
          </div>
          <div className="px-3 py-2 space-y-0">
            {[
              { time: '12:04:32', event: 'api_request', meter: 'api_calls', value: '1', color: 'bg-brand-500' },
              { time: '12:04:31', event: 'api_request', meter: 'api_calls', value: '1', color: 'bg-brand-500' },
              { time: '12:04:28', event: 'storage_write', meter: 'storage_gb', value: '0.02', color: 'bg-success' },
              { time: '12:04:25', event: 'api_request', meter: 'api_calls', value: '1', color: 'bg-brand-500' },
              { time: '12:04:22', event: 'compute_sec', meter: 'compute', value: '3.4', color: 'bg-warning' },
            ].map((evt, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-line/30 last:border-0">
                <div className={`h-1.5 w-1.5 rounded-full ${evt.color} flex-shrink-0`}></div>
                <span className="text-[9px] font-mono text-muted w-[52px]">{evt.time}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-ink truncate block">{evt.event}</span>
                </div>
                <span className="text-[9px] font-mono text-muted">+{evt.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
