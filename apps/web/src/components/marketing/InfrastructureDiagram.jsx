/**
 * InfrastructureDiagram: An animated SVG showing the event flow through
 * the Llah billing pipeline. Uses the actual architecture:
 * App -> Events API -> Meters -> Pricing Engine -> Invoice Generator -> Ledger
 */
export default function InfrastructureDiagram() {
  const nodeStyle = 'fill-white stroke-[#e5e5e5]';
  const activeNodeStyle = 'fill-white stroke-[#171717]';
  const labelStyle = 'text-[10px] fill-[#737373] font-medium';
  const titleStyle = 'text-[11px] fill-[#171717] font-semibold';

  return (
    <div className="mx-auto w-full max-w-4xl" aria-label="Architecture diagram showing how usage events flow through the Llah billing pipeline">
      <svg viewBox="0 0 820 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" role="img">
        <title>Llah billing infrastructure architecture</title>

        {/* ─── Connection Paths ─── */}
        {/* Your App -> Events API */}
        <path d="M130 110 L200 110" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M130 110 L200 110" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" className="hero-data-flow" opacity="0.6" />

        {/* Events API -> Meters */}
        <path d="M310 110 L380 110" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M310 110 L380 110" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" className="hero-data-flow" style={{ animationDelay: '0.5s' }} opacity="0.6" />

        {/* Meters -> Pricing Engine */}
        <path d="M490 110 L560 110" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M490 110 L560 110" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" className="hero-data-flow" style={{ animationDelay: '1s' }} opacity="0.6" />

        {/* Pricing Engine -> Invoice */}
        <path d="M670 110 L740 110" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M670 110 L740 110" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" className="hero-data-flow" style={{ animationDelay: '1.5s' }} opacity="0.6" />

        {/* Events API -> Webhooks (downward branch) */}
        <path d="M255 140 L255 200 L200 200" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />

        {/* Meters -> Usage Aggregation (downward branch) */}
        <path d="M435 140 L435 200 L380 200" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />

        {/* Invoice -> Ledger (downward branch) */}
        <path d="M780 140 L780 200 L720 200" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />

        {/* ─── Primary Nodes ─── */}

        {/* Your Application */}
        <g>
          <rect x="20" y="80" width="110" height="60" rx="8" className={activeNodeStyle} strokeWidth="1.5" />
          <rect x="20" y="80" width="110" height="60" rx="8" fill="#171717" opacity="0.03" />
          {/* App icon */}
          <rect x="38" y="98" width="16" height="16" rx="3" fill="#171717" opacity="0.1" />
          <rect x="42" y="102" width="8" height="3" rx="1" fill="#171717" opacity="0.4" />
          <rect x="42" y="107" width="5" height="3" rx="1" fill="#171717" opacity="0.25" />
          <text x="60" y="107" className={titleStyle} dominantBaseline="middle">Your App</text>
          <text x="38" y="130" className={labelStyle}>HTTP POST</text>
        </g>

        {/* Events API */}
        <g>
          <rect x="200" y="80" width="110" height="60" rx="8" className={activeNodeStyle} strokeWidth="1.5" />
          <rect x="200" y="80" width="110" height="60" rx="8" fill="#0284c7" opacity="0.04" />
          {/* API icon */}
          <circle cx="228" cy="105" r="8" fill="none" stroke="#0284c7" strokeWidth="1.5" />
          <text x="228" y="108" textAnchor="middle" className="text-[7px] fill-[#0284c7] font-bold">API</text>
          <text x="242" y="107" className={titleStyle} dominantBaseline="middle">Events</text>
          <text x="218" y="130" className={labelStyle}>Validate + Store</text>
        </g>

        {/* Meters */}
        <g>
          <rect x="380" y="80" width="110" height="60" rx="8" className={activeNodeStyle} strokeWidth="1.5" />
          <rect x="380" y="80" width="110" height="60" rx="8" fill="#0284c7" opacity="0.04" />
          {/* Meter bars */}
          <rect x="400" y="105" width="3" height="8" rx="1" fill="#0284c7" opacity="0.5" />
          <rect x="405" y="101" width="3" height="12" rx="1" fill="#0284c7" opacity="0.7" />
          <rect x="410" y="98" width="3" height="15" rx="1" fill="#0284c7" opacity="0.9" />
          <text x="420" y="107" className={titleStyle} dominantBaseline="middle">Meters</text>
          <text x="398" y="130" className={labelStyle}>Aggregate Usage</text>
        </g>

        {/* Pricing Engine */}
        <g>
          <rect x="560" y="80" width="110" height="60" rx="8" className={activeNodeStyle} strokeWidth="1.5" />
          <rect x="560" y="80" width="110" height="60" rx="8" fill="#0284c7" opacity="0.04" />
          {/* Dollar icon */}
          <text x="588" y="109" textAnchor="middle" className="text-[14px] fill-[#0284c7]" dominantBaseline="middle">$</text>
          <text x="600" y="107" className={titleStyle} dominantBaseline="middle">Pricing</text>
          <text x="578" y="130" className={labelStyle}>Apply Rules</text>
        </g>

        {/* Invoices */}
        <g>
          <rect x="740" y="80" width="70" height="60" rx="8" className={activeNodeStyle} strokeWidth="1.5" />
          <rect x="740" y="80" width="70" height="60" rx="8" fill="#10b981" opacity="0.05" />
          {/* Doc icon */}
          <rect x="762" y="96" width="12" height="15" rx="2" fill="none" stroke="#10b981" strokeWidth="1.5" />
          <line x1="765" y1="101" x2="771" y2="101" stroke="#10b981" strokeWidth="1" />
          <line x1="765" y1="104" x2="771" y2="104" stroke="#10b981" strokeWidth="1" />
          <line x1="765" y1="107" x2="769" y2="107" stroke="#10b981" strokeWidth="1" />
          <text x="760" y="130" className={titleStyle}>Invoice</text>
        </g>

        {/* ─── Secondary Nodes (below) ─── */}

        {/* Webhooks */}
        <g>
          <rect x="140" y="185" width="80" height="36" rx="6" className={nodeStyle} strokeWidth="1" />
          <text x="180" y="205" textAnchor="middle" className="text-[10px] fill-[#737373]" dominantBaseline="middle">Webhooks</text>
        </g>

        {/* Usage Aggregation */}
        <g>
          <rect x="330" y="185" width="80" height="36" rx="6" className={nodeStyle} strokeWidth="1" />
          <text x="370" y="205" textAnchor="middle" className="text-[10px] fill-[#737373]" dominantBaseline="middle">Aggregation</text>
        </g>

        {/* Ledger */}
        <g>
          <rect x="700" y="185" width="80" height="36" rx="6" className={nodeStyle} strokeWidth="1" />
          <text x="740" y="205" textAnchor="middle" className="text-[10px] fill-[#737373]" dominantBaseline="middle">Ledger</text>
        </g>

        {/* ─── Flow arrows (small triangles at connection points) ─── */}
        <polygon points="197,106 197,114 204,110" fill="#d4d4d4" />
        <polygon points="377,106 377,114 384,110" fill="#d4d4d4" />
        <polygon points="557,106 557,114 564,110" fill="#d4d4d4" />
        <polygon points="737,106 737,114 744,110" fill="#d4d4d4" />

        {/* ─── Stage labels at top ─── */}
        <text x="75" y="65" textAnchor="middle" className="text-[9px] fill-[#a3a3a3] font-medium uppercase" letterSpacing="0.8">Ingest</text>
        <text x="255" y="65" textAnchor="middle" className="text-[9px] fill-[#a3a3a3] font-medium uppercase" letterSpacing="0.8">Validate</text>
        <text x="435" y="65" textAnchor="middle" className="text-[9px] fill-[#a3a3a3] font-medium uppercase" letterSpacing="0.8">Aggregate</text>
        <text x="615" y="65" textAnchor="middle" className="text-[9px] fill-[#a3a3a3] font-medium uppercase" letterSpacing="0.8">Price</text>
        <text x="775" y="65" textAnchor="middle" className="text-[9px] fill-[#a3a3a3] font-medium uppercase" letterSpacing="0.8">Invoice</text>

        {/* ─── Top flow line ─── */}
        <line x1="120" y1="72" x2="820" y2="72" stroke="#f5f5f5" strokeWidth="1" />

        {/* ─── Small animated pulse dots on connections ─── */}
        <circle r="3" fill="#0284c7" opacity="0.8" className="hero-node-pulse">
          <animateMotion dur="3s" repeatCount="indefinite" path="M130,110 L200,110" />
        </circle>
        <circle r="3" fill="#0284c7" opacity="0.6" className="hero-node-pulse" style={{ animationDelay: '0.8s' }}>
          <animateMotion dur="3s" repeatCount="indefinite" path="M310,110 L380,110" begin="1s" />
        </circle>
        <circle r="3" fill="#0284c7" opacity="0.5" className="hero-node-pulse" style={{ animationDelay: '1.6s' }}>
          <animateMotion dur="3s" repeatCount="indefinite" path="M490,110 L560,110" begin="2s" />
        </circle>
        <circle r="2.5" fill="#10b981" opacity="0.7" className="hero-node-pulse" style={{ animationDelay: '2.4s' }}>
          <animateMotion dur="3s" repeatCount="indefinite" path="M670,110 L740,110" begin="3s" />
        </circle>
      </svg>
    </div>
  );
}
