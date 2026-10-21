/**
 * Verify Email visual: animated email envelope with security/verification theme.
 * Light-mode variant matching the other AuthVisual* components.
 */
export default function AuthVisualVerify() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* Main envelope card */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 p-5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-ink/70">Email Verification</span>
          <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">Pending</span>
        </div>

        {/* Envelope illustration */}
        <div className="flex justify-center py-2">
          <div className="relative">
            {/* Envelope body */}
            <div className="w-[120px] h-[84px] rounded-lg bg-gradient-to-b from-sky-100 to-sky-50 border-2 border-sky-200/80 relative overflow-hidden shadow-sm">
              {/* Envelope flap */}
              <div
                className="absolute top-0 left-0 right-0 h-[42px]"
                style={{
                  background: 'linear-gradient(135deg, #e0f2fe 50%, transparent 50%)',
                  borderBottom: '1.5px solid #bae6fd',
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[42px]"
                style={{
                  background: 'linear-gradient(225deg, #e0f2fe 50%, transparent 50%)',
                  borderBottom: '1.5px solid #bae6fd',
                }}
              />
              {/* Letter peeking out */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[70px] h-[30px] bg-white rounded border border-sky-100 shadow-sm flex flex-col gap-1 p-1.5">
                <div className="h-1 bg-sky-200 rounded-full w-full" />
                <div className="h-1 bg-sky-100 rounded-full w-3/4" />
                <div className="h-1 bg-sky-100 rounded-full w-1/2" />
              </div>
            </div>

            {/* Verified checkmark badge */}
            <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Animated send dots */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-sky-400"
                  style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Steps checklist */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 overflow-hidden backdrop-blur-sm shadow-sm">
        <div className="px-4 py-2.5 border-b border-sky-100">
          <span className="text-[11px] font-semibold text-ink/70">Account Setup</span>
        </div>
        {[
          { label: 'Create account',       done: true },
          { label: 'Verify email address', done: false, active: true },
          { label: 'Create organization',  done: false },
          { label: 'Add first meter',      done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-sky-50 last:border-0">
            <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.done
                ? 'bg-emerald-500'
                : step.active
                  ? 'border-2 border-sky-500 bg-sky-50'
                  : 'border-2 border-sky-200 bg-white'
            }`}>
              {step.done && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {step.active && (
                <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              )}
            </div>
            <span className={`text-[11px] font-medium ${
              step.done ? 'text-muted line-through' : step.active ? 'text-ink' : 'text-muted'
            }`}>
              {step.label}
            </span>
            {step.active && (
              <span className="ml-auto text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-200/60">
                Now
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-sky-200/60 bg-white/70 px-4 py-3 backdrop-blur-sm shadow-sm flex items-start gap-2.5">
        <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="h-3 w-3 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-ink/80 mb-0.5">Keeps your account safe</p>
          <p className="text-[10px] text-muted leading-relaxed">
            Verified accounts unlock API key creation, webhooks, and billing features.
          </p>
        </div>
      </div>
    </div>
  );
}
