import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Hash, FileText, Settings, Users, CreditCard, Code2, BarChart3, Zap, Bell, Shield, Database, Gauge, Flag, Receipt, Tag, Percent, DollarSign, RefreshCw, Clock } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',          path: '/dashboard',          icon: BarChart3,   section: 'Overview' },
  { label: 'Usage',              path: '/usage',              icon: Gauge,       section: 'Overview' },
  { label: 'Revenue',            path: '/revenue',            icon: DollarSign,  section: 'Overview' },
  { label: 'Reports',            path: '/reports',            icon: FileText,    section: 'Overview' },
  { label: 'Observability',      path: '/observability',      icon: Zap,         section: 'Overview' },
  { label: 'Customers',          path: '/customers',          icon: Users,       section: 'Billing' },
  { label: 'Create customer',    path: '/customers/new',      icon: Users,       section: 'Billing' },
  { label: 'Meters',             path: '/meters',             icon: Gauge,       section: 'Billing' },
  { label: 'Products',           path: '/products',           icon: Database,    section: 'Billing' },
  { label: 'Pricing',            path: '/pricing',            icon: Tag,         section: 'Billing' },
  { label: 'Plans',              path: '/plans',              icon: CreditCard,  section: 'Billing' },
  { label: 'Subscriptions',      path: '/subscriptions',      icon: RefreshCw,   section: 'Billing' },
  { label: 'Invoices',           path: '/invoices',           icon: Receipt,     section: 'Billing' },
  { label: 'Payments',           path: '/payments',           icon: CreditCard,  section: 'Billing' },
  { label: 'Credits',            path: '/credits',            icon: DollarSign,  section: 'Billing' },
  { label: 'Billing periods',    path: '/billing-periods',    icon: Clock,       section: 'Billing' },
  { label: 'Adjustments',        path: '/adjustments',        icon: Hash,        section: 'Billing' },
  { label: 'Refunds',            path: '/refunds',            icon: RefreshCw,   section: 'Billing' },
  { label: 'Coupons',            path: '/coupons',            icon: Percent,     section: 'Billing' },
  { label: 'Tax',                path: '/tax',                icon: Receipt,     section: 'Billing' },
  { label: 'API keys',           path: '/api-keys',           icon: Code2,       section: 'Developers' },
  { label: 'Events',             path: '/events',             icon: Zap,         section: 'Developers' },
  { label: 'Webhooks',           path: '/webhooks',           icon: Zap,         section: 'Developers' },
  { label: 'Developer tools',    path: '/developer',          icon: Code2,       section: 'Developers' },
  { label: 'Alerts',             path: '/alerts',             icon: Bell,        section: 'Developers' },
  { label: 'Notifications',      path: '/notifications',      icon: Bell,        section: 'Developers' },
  { label: 'Feature flags',      path: '/feature-flags',      icon: Flag,        section: 'Developers' },
  { label: 'Jobs',               path: '/jobs',               icon: Zap,         section: 'Developers' },
  { label: 'Organizations',      path: '/organizations',      icon: Shield,      section: 'Workspace' },
  { label: 'Audit log',          path: '/audit',              icon: FileText,    section: 'Workspace' },
  { label: 'Team',               path: '/team',               icon: Users,       section: 'Workspace' },
  { label: 'Settings',           path: '/settings',           icon: Settings,    section: 'Workspace' },
  { label: 'Admin',              path: '/admin',              icon: Shield,      section: 'Workspace' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS;
    const q = query.toLowerCase();
    return NAV_ITEMS.filter(
      item => item.label.toLowerCase().includes(q) || item.section.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = useCallback((item) => {
    navigate(item.path);
    setOpen(false);
  }, [navigate]);

  // Keyboard nav within list
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      handleSelect(filtered[activeIndex]);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[activeIndex];
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!open) return null;

  // Group by section
  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.section]) grouped[item.section] = [];
    grouped[item.section].push(item);
  });

  let flatIndex = -1;

  return (
    <>
      <div className="overlay-backdrop" onClick={() => setOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <div className="w-full max-w-lg bg-surface border border-line rounded-xl shadow-overlay animate-scale-in">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-line">
            <Search className="h-4 w-4 text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search pages and actions..."
              className="flex-1 py-3 bg-transparent text-sm text-ink placeholder:text-muted-foreground outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-canvas-subtle border border-line rounded px-1.5 py-0.5 font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted">
                No results for "{query}"
              </div>
            ) : (
              Object.entries(grouped).map(([section, items]) => (
                <div key={section}>
                  <div className="px-4 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {section}
                  </div>
                  {items.map(item => {
                    flatIndex++;
                    const idx = flatIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left transition-colors ${
                          idx === activeIndex ? 'bg-canvas-subtle text-ink' : 'text-muted hover:bg-canvas-subtle hover:text-ink'
                        }`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {idx === activeIndex && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-line flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="bg-canvas-subtle border border-line rounded px-1 py-0.5 font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-canvas-subtle border border-line rounded px-1 py-0.5 font-mono">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-canvas-subtle border border-line rounded px-1 py-0.5 font-mono">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
