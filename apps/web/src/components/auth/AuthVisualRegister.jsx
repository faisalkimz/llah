/**
 * Register visual: Onboarding steps + API integration preview.
 * Light-mode variant.
 */
export default function AuthVisualRegister() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Setup progress */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-ink/70">Getting Started</span>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">3 steps</span>
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
                  ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                  : 'bg-sky-50 border border-sky-200 text-sky-500'
              }`}>
                {s.done ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.step}
              </div>
              <div>
                <div className="text-[12px] font-semibold text-ink">{s.label}</div>
                <div className="text-[10px] text-muted">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API integration preview */}
      <div className="rounded-xl border border-neutral-200 bg-[#1e1e1e] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-700/50">
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">POST</span>
          <span className="text-[10px] font-mono text-neutral-400">/v1/events</span>
        </div>
        <div className="px-4 py-3 font-mono text-[10px] leading-[1.8]">
          <div><span className="text-neutral-500">{'{'}</span></div>
          <div className="pl-3"><span className="text-[#9cdcfe]">"customer_id"</span><span className="text-neutral-500">: </span><span className="text-[#ce9178]">"cus_8a3f2b"</span><span className="text-neutral-500">,</span></div>
          <div className="pl-3"><span className="text-[#9cdcfe]">"meter"</span><span className="text-neutral-500">: </span><span className="text-[#ce9178]">"api_requests"</span><span className="text-neutral-500">,</span></div>
          <div className="pl-3"><span className="text-[#9cdcfe]">"value"</span><span className="text-neutral-500">: </span><span className="text-[#b5cea8]">1</span></div>
          <div><span className="text-neutral-500">{'}'}</span></div>
        </div>
        <div className="px-4 py-2 border-t border-neutral-700/50 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
          <span className="text-[9px] text-neutral-500">201 Created · 14ms</span>
        </div>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Usage tracking' },
          { label: 'Auto invoicing' },
          { label: 'Flexible pricing' },
          { label: 'Revenue reports' },
        ].map((cap, i) => (
          <div key={i} className="rounded-lg border border-sky-200/60 bg-white/60 px-3 py-2.5 flex items-center gap-2 backdrop-blur-sm">
            <svg className="h-3 w-3 text-sky-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] text-ink font-medium">{cap.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
