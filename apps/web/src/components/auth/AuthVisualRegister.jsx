/**
 * Register visual: Onboarding steps + API integration preview
 * showing how quickly you can start sending usage events.
 */
export default function AuthVisualRegister() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Setup progress */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-white/70">Getting Started</span>
          <span className="text-[9px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">3 steps</span>
        </div>
        <div className="space-y-3">
          {[
            { step: '1', label: 'Create your account', desc: 'Set up your workspace', done: true },
            { step: '2', label: 'Configure a meter', desc: 'Define what to track', done: false },
            { step: '3', label: 'Send your first event', desc: 'Integrate the API', done: false },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                s.done
                  ? 'bg-emerald-400/20 text-emerald-400'
                  : 'border border-white/[0.12] text-slate-500'
              }`}>
                {s.done ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.step}
              </div>
              <div>
                <div className="text-[12px] font-semibold text-white/80">{s.label}</div>
                <div className="text-[10px] text-slate-500">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API integration preview */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">POST</span>
          <span className="text-[10px] font-mono text-slate-400">/v1/events</span>
        </div>
        <div className="px-4 py-3 font-mono text-[10px] leading-[1.8]">
          <div><span className="text-slate-500">{'{'}</span></div>
          <div className="pl-3"><span className="text-sky-300">"customer_id"</span><span className="text-slate-500">: </span><span className="text-amber-300">"cus_8a3f2b"</span><span className="text-slate-500">,</span></div>
          <div className="pl-3"><span className="text-sky-300">"meter"</span><span className="text-slate-500">: </span><span className="text-amber-300">"api_requests"</span><span className="text-slate-500">,</span></div>
          <div className="pl-3"><span className="text-sky-300">"value"</span><span className="text-slate-500">: </span><span className="text-emerald-300">1</span></div>
          <div><span className="text-slate-500">{'}'}</span></div>
        </div>
        <div className="px-4 py-2 border-t border-white/[0.06] flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
          <span className="text-[9px] text-slate-500">201 Created · 14ms</span>
        </div>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Usage tracking', icon: '⟶' },
          { label: 'Auto invoicing', icon: '⟶' },
          { label: 'Flexible pricing', icon: '⟶' },
          { label: 'Revenue reports', icon: '⟶' },
        ].map((cap, i) => (
          <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex items-center gap-2">
            <span className="text-[10px] text-sky-400/60">{cap.icon}</span>
            <span className="text-[10px] text-slate-400 font-medium">{cap.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
