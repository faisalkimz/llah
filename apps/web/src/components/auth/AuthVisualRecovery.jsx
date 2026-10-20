/**
 * Recovery visual: Secure access + account protection.
 * Light-mode variant for forgot-password and reset-password.
 */
export default function AuthVisualRecovery({ variant = 'forgot' }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Security status card */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 p-5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 border border-sky-200">
            <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-ink">Account Security</div>
            <div className="text-[10px] text-muted">
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
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-sky-50/60 border border-sky-100 px-3 py-2">
              {item.status === true ? (
                <div className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                  <svg className="h-2.5 w-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : item.status === 'pending' ? (
                <div className="h-4 w-4 rounded-full border-2 border-sky-300 border-t-sky-600 animate-spin flex-shrink-0"></div>
              ) : (
                <div className="h-4 w-4 rounded-full border border-neutral-200 flex-shrink-0"></div>
              )}
              <span className={`text-[11px] font-medium ${item.status === true ? 'text-ink/70' : item.status === 'pending' ? 'text-sky-700' : 'text-muted/60'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure diagram */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 p-4 backdrop-blur-sm shadow-sm">
        <svg viewBox="0 0 360 100" fill="none" className="w-full">
          {/* Connection lines */}
          <line x1="90" y1="50" x2="150" y2="50" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="210" y1="50" x2="270" y2="50" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Animated dots */}
          <circle r="2.5" fill="#0284c7" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite" path="M90,50 L150,50" />
          </circle>
          <circle r="2.5" fill="#10b981" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite" path="M210,50 L270,50" begin="1.5s" />
          </circle>

          {/* Nodes */}
          <g>
            <rect x="20" y="30" width="70" height="40" rx="8" fill="white" stroke="#e0f2fe" strokeWidth="1.5" />
            <text x="55" y="48" textAnchor="middle" className="text-[9px]" fill="#64748b" dominantBaseline="middle">Your App</text>
          </g>
          <g>
            <rect x="150" y="30" width="60" height="40" rx="8" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="1.5" />
            <text x="180" y="48" textAnchor="middle" className="text-[9px]" fill="#0369a1" dominantBaseline="middle" fontWeight="600">Auth</text>
          </g>
          <g>
            <rect x="270" y="30" width="70" height="40" rx="8" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1.5" />
            <text x="305" y="48" textAnchor="middle" className="text-[9px]" fill="#047857" dominantBaseline="middle" fontWeight="600">Dashboard</text>
          </g>

          {/* Arrow tips */}
          <polygon points="148,47 148,53 153,50" fill="#7dd3fc" />
          <polygon points="268,47 268,53 273,50" fill="#6ee7b7" />
        </svg>
      </div>

      {/* Trust indicators */}
      <div className="flex gap-2">
        {[
          { label: 'Encrypted at rest', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60' },
          { label: 'Session management', color: 'text-sky-700 bg-sky-50 border-sky-200/60' },
        ].map((item, i) => (
          <div key={i} className={`flex-1 rounded-lg border px-3 py-2 text-center text-[9px] font-semibold ${item.color}`}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
