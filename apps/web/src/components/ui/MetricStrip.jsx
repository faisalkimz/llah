export default function MetricStrip({ items = [], className = '' }) {
  return (
    <div className={`metric-strip ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="metric-cell">
          <div className="metric-label">{item.label}</div>
          <div className="metric-value">{item.value ?? '—'}</div>
          {item.sub && <div className="metric-sub">{item.sub}</div>}
        </div>
      ))}
    </div>
  );
}
