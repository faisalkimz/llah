/**
 * BillingLifecycle: Visual showing a subscription moving through states.
 * Matches real subscription states from the Llah platform.
 */
export default function BillingLifecycle() {
  const stages = [
    {
      state: 'CREATED',
      label: 'Subscription created',
      detail: 'Customer selects a plan',
      color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      dotColor: 'bg-neutral-400',
      lineActive: true,
    },
    {
      state: 'ACTIVE',
      label: 'Active billing',
      detail: 'Usage events are tracked',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
      lineActive: true,
    },
    {
      state: 'PERIOD END',
      label: 'Period closes',
      detail: 'Usage is aggregated',
      color: 'bg-brand-50 text-brand-700 border-brand-100',
      dotColor: 'bg-brand-500',
      lineActive: true,
    },
    {
      state: 'INVOICED',
      label: 'Invoice generated',
      detail: 'Line items calculated',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
      lineActive: true,
    },
    {
      state: 'PAID',
      label: 'Payment recorded',
      detail: 'Ledger entry created',
      color: 'bg-green-50 text-green-700 border-green-200',
      dotColor: 'bg-green-500',
      lineActive: false,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl" aria-label="Subscription billing lifecycle">
      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        <div className="flex items-start">
          {stages.map((stage, i) => (
            <div key={i} className="flex flex-1 flex-col items-center">
              {/* Connector line + dot */}
              <div className="flex w-full items-center">
                {i > 0 && <div className="h-[2px] flex-1 bg-line"></div>}
                {i === 0 && <div className="flex-1"></div>}
                <div className={`relative z-10 h-4 w-4 rounded-full border-2 border-white shadow-sm ${stage.dotColor}`}>
                  <div className={`absolute inset-0 rounded-full ${stage.dotColor} opacity-20 animate-ping`} style={{ animationDuration: '3s', animationDelay: `${i * 0.5}s` }}></div>
                </div>
                {i < stages.length - 1 && <div className="h-[2px] flex-1 bg-line"></div>}
                {i === stages.length - 1 && <div className="flex-1"></div>}
              </div>

              {/* State badge */}
              <div className={`mt-3 rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wide ${stage.color}`}>
                {stage.state}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <div className="text-[12px] font-semibold text-ink">{stage.label}</div>
                <div className="text-[11px] text-muted mt-0.5">{stage.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden space-y-0">
        {stages.map((stage, i) => (
          <div key={i} className="flex gap-4">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              {i > 0 && <div className="w-[2px] h-4 bg-line"></div>}
              <div className={`relative z-10 h-3.5 w-3.5 rounded-full ${stage.dotColor} flex-shrink-0`}></div>
              {i < stages.length - 1 && <div className="w-[2px] flex-1 bg-line"></div>}
            </div>

            {/* Content */}
            <div className="pb-6 pt-0">
              <div className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide ${stage.color} mb-1`}>
                {stage.state}
              </div>
              <div className="text-[13px] font-semibold text-ink">{stage.label}</div>
              <div className="text-[12px] text-muted">{stage.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
