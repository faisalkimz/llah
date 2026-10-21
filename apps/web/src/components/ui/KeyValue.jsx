export default function KeyValue({ items = [], className = '' }) {
  return (
    <dl className={`kv-list ${className}`}>
      {items.map(({ label, value, mono }, i) => (
        <div key={i} className="kv-row">
          <dt className="kv-key">{label}</dt>
          <dd className={`kv-value ${mono ? 'font-mono text-xs' : ''}`}>
            {value ?? '\u2014'}
          </dd>
        </div>
      ))}
    </dl>
  );
}
