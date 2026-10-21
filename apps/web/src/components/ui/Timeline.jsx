export default function Timeline({ items = [], className = '' }) {
  return (
    <div className={`timeline ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="timeline-item">
          <div className={`timeline-dot ${item.active ? 'timeline-dot-active' : ''}`} />
          <div className="ml-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink">{item.title}</span>
              {item.badge}
            </div>
            {item.description && (
              <p className="text-xs text-muted mt-0.5">{item.description}</p>
            )}
            {item.timestamp && (
              <time className="text-xs text-muted-foreground mt-0.5 block">
                {typeof item.timestamp === 'string'
                  ? item.timestamp
                  : item.timestamp.toLocaleString()}
              </time>
            )}
            {item.content && <div className="mt-2">{item.content}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
