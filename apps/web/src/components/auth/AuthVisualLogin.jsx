/**
 * Login visual: Dashboard composition showing revenue data,
 * invoice table, and event stream. Light-mode variant.
 */
export default function AuthVisualLogin() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Mini dashboard card */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-ink/70">Revenue Overview</span>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">Live</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Active subs', value: '24' },
            { label: 'Open invoices', value: '7' },
            { label: 'Events today', value: '12.8k' },
          ].map((stat, i) => (
            <div key={i} className="rounded-lg bg-sky-50/80 border border-sky-100 px-3 py-2.5">
              <div className="text-[9px] text-muted font-medium mb-0.5">{stat.label}</div>
              <div className="text-[18px] font-extrabold tracking-tight text-ink">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 overflow-hidden backdrop-blur-sm shadow-sm">
        <div className="px-4 py-2.5 border-b border-sky-100">
          <span className="text-[11px] font-semibold text-ink/70">Recent Invoices</span>
        </div>
        {[
          { id: 'INV-0047', name: 'Acme Corp', amount: '$2,340', status: 'Paid', dot: 'bg-emerald-500' },
          { id: 'INV-0046', name: 'TechStart Inc', amount: '$890', status: 'Open', dot: 'bg-sky-500' },
          { id: 'INV-0045', name: 'DataFlow Labs', amount: '$1,567', status: 'Draft', dot: 'bg-neutral-400' },
        ].map((inv, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-sky-50 last:border-0">
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] font-mono text-muted w-[62px]">{inv.id}</span>
              <span className="text-[11px] text-ink font-medium">{inv.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-ink">{inv.amount}</span>
              <div className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${inv.dot}`}></div>
                <span className="text-[9px] text-muted">{inv.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event stream */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 overflow-hidden backdrop-blur-sm shadow-sm">
        <div className="px-4 py-2.5 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-semibold text-ink/70">Event Stream</span>
          </div>
        </div>
        <div className="px-3 py-1.5">
          {[
            { time: '12:04:32', event: 'api_request', val: '+1' },
            { time: '12:04:31', event: 'storage_write', val: '+0.02' },
            { time: '12:04:28', event: 'api_request', val: '+1' },
            { time: '12:04:25', event: 'compute_sec', val: '+3.4' },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-sky-50/80 last:border-0">
              <span className="text-[8px] font-mono text-muted w-[50px]">{e.time}</span>
              <span className="text-[10px] text-sky-600 font-mono font-medium">{e.event}</span>
              <span className="ml-auto text-[9px] font-mono text-muted">{e.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
