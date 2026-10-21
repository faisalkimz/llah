export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`tab-list ${className}`} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          className={`tab ${active === tab.value ? 'tab-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count != null && (
            <span className="ml-1.5 text-xs text-muted-foreground">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
