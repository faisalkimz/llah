/**
 * Login visual: A dashboard composition showing revenue data,
 * invoice table, and event stream to welcome users back.
 */
export default function AuthVisualLogin() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Mini dashboard card */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-white/70">Revenue Overview</span>
          <span className="text-[9px] font-medium text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">Live</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active subs', value: '24', color: 'text-white' },
            { label: 'Open invoices', value: '7', color: 'text-white' },
            { label: 'Events today', value: '12.8k', color: 'text-white' },
          ].map((stat, i) => (
            <div key={i} className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5">
              <div className="text-[9px] text-slate-500 font-medium mb-0.5">{stat.label}</div>
              <div className={`text-[18px] font-extrabold tracking-tight ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] overflow-hidden backdrop-blur-sm">
        <div className="px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[11px] font-semibold text-white/70">Recent Invoices</span>
        </div>
        {[
          { id: 'INV-0047', name: 'Acme Corp', amount: '$2,340', status: 'Paid', dot: 'bg-emerald-400' },
          { id: 'INV-0046', name: 'TechStart Inc', amount: '$890', status: 'Open', dot: 'bg-sky-400' },
          { id: 'INV-0045', name: 'DataFlow Labs', amount: '$1,567', status: 'Draft', dot: 'bg-slate-500' },
        ].map((inv, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] last:border-0">
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] font-mono text-slate-500 w-[62px]">{inv.id}</span>
              <span className="text-[11px] text-white/80">{inv.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-white/90">{inv.amount}</span>
              <div className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${inv.dot}`}></div>
                <span className="text-[9px] text-slate-500">{inv.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event stream */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] overflow-hidden backdrop-blur-sm">
        <div className="px-4 py-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[11px] font-semibold text-white/70">Event Stream</span>
          </div>
        </div>
        <div className="px-3 py-1.5">
          {[
            { time: '12:04:32', event: 'api_request', meter: 'api_calls', val: '+1' },
            { time: '12:04:31', event: 'storage_write', meter: 'storage_gb', val: '+0.02' },
            { time: '12:04:28', event: 'api_request', meter: 'api_calls', val: '+1' },
            { time: '12:04:25', event: 'compute_sec', meter: 'compute', val: '+3.4' },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-white/[0.03] last:border-0">
              <span className="text-[8px] font-mono text-slate-600 w-[50px]">{e.time}</span>
              <span className="text-[10px] text-sky-400/80 font-mono">{e.event}</span>
              <span className="ml-auto text-[9px] font-mono text-slate-500">{e.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
