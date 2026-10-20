/**
 * Recovery visual: Secure access + account protection illustration
 * used on forgot-password and reset-password pages.
 */
export default function AuthVisualRecovery({ variant = 'forgot' }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Security status card */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20">
            <svg className="h-4 w-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-white/80">Account Security</div>
            <div className="text-[10px] text-slate-500">
              {variant === 'forgot' ? 'Recovery process' : 'Password update'}
            </div>
          </div>
        </div>

        {/* Security checklist */}
        <div className="space-y-2.5">
          {(variant === 'forgot' ? [
            { label: 'Email verified', status: true },
            { label: 'Reset link sent', status: 'pending' },
            { label: 'Password updated', status: false },
          ] : [
            { label: 'Reset token validated', status: true },
            { label: 'New password set', status: 'pending' },
            { label: 'Sessions refreshed', status: false },
          ]).map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
              {item.status === true ? (
                <div className="h-4 w-4 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-2.5 w-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : item.status === 'pending' ? (
                <div className="h-4 w-4 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin flex-shrink-0"></div>
              ) : (
                <div className="h-4 w-4 rounded-full border border-white/10 flex-shrink-0"></div>
              )}
              <span className={`text-[11px] font-medium ${item.status === true ? 'text-white/70' : item.status === 'pending' ? 'text-sky-400' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure diagram */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
        <svg viewBox="0 0 360 100" fill="none" className="w-full">
          {/* Connection lines */}
          <line x1="90" y1="50" x2="150" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="210" y1="50" x2="270" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

          {/* Animated dots */}
          <circle r="2" fill="#0ea5e9" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite" path="M90,50 L150,50" />
          </circle>
          <circle r="2" fill="#10b981" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite" path="M210,50 L270,50" begin="1.5s" />
          </circle>

          {/* Nodes */}
          <g>
            <rect x="20" y="30" width="70" height="40" rx="8" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.1" />
            <text x="55" y="48" textAnchor="middle" className="text-[9px]" fill="#94a3b8" dominantBaseline="middle">Your App</text>
          </g>
          <g>
            <rect x="150" y="30" width="60" height="40" rx="8" fill="white" fillOpacity="0.04" stroke="#0ea5e9" strokeOpacity="0.2" />
            <text x="180" y="48" textAnchor="middle" className="text-[9px]" fill="#38bdf8" dominantBaseline="middle">Auth</text>
          </g>
          <g>
            <rect x="270" y="30" width="70" height="40" rx="8" fill="white" fillOpacity="0.04" stroke="#10b981" strokeOpacity="0.2" />
            <text x="305" y="48" textAnchor="middle" className="text-[9px]" fill="#34d399" dominantBaseline="middle">Dashboard</text>
          </g>

          {/* Arrow tips */}
          <polygon points="148,47 148,53 153,50" fill="#334155" />
          <polygon points="268,47 268,53 273,50" fill="#334155" />
        </svg>
      </div>

      {/* Trust indicators */}
      <div className="flex gap-2">
        {[
          { label: 'Encrypted at rest', color: 'text-emerald-400/60 bg-emerald-400/5 border-emerald-400/10' },
          { label: 'Session management', color: 'text-sky-400/60 bg-sky-400/5 border-sky-400/10' },
        ].map((item, i) => (
          <div key={i} className={`flex-1 rounded-lg border px-3 py-2 text-center text-[9px] font-medium ${item.color}`}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
