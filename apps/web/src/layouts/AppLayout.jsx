import { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import CommandPalette from '../components/ui/CommandPalette.jsx';
import Dropdown, { DropdownItem, DropdownSeparator } from '../components/ui/Dropdown.jsx';
import {
  LayoutDashboard, Activity, TrendingUp, FileBarChart, HeartPulse,
  Users, Gauge, Package, Tag, Layers, RefreshCw, FileText, CreditCard,
  Wallet, Calendar, ArrowLeftRight, Undo2, Ticket, Percent,
  KeyRound, Zap, Webhook, Terminal, TriangleAlert, Bell, Flag, Cog,
  Building2, ScrollText, UserCog, Settings, Shield,
  Search, LogOut, Monitor, Mail, Menu, X,
  Sun, Moon, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'Home',           to: '/dashboard',     icon: LayoutDashboard },
      { label: 'Usage',          to: '/usage',         icon: Activity },
      { label: 'Revenue',        to: '/revenue',       icon: TrendingUp },
      { label: 'Reports',        to: '/reports',       icon: FileBarChart },
      { label: 'Observability',  to: '/observability', icon: HeartPulse },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      { label: 'Customers',        to: '/customers',       icon: Users },
      { label: 'Subscriptions',    to: '/subscriptions',   icon: RefreshCw },
      { label: 'Invoices',         to: '/invoices',        icon: FileText },
      { label: 'Payments',         to: '/payments',        icon: CreditCard },
      { label: 'Credits',          to: '/credits',         icon: Wallet },
      { label: 'Billing periods',  to: '/billing-periods', icon: Calendar },
      { label: 'Adjustments',      to: '/adjustments',     icon: ArrowLeftRight },
      { label: 'Refunds',          to: '/refunds',         icon: Undo2 },
      { label: 'Coupons',          to: '/coupons',         icon: Ticket },
      { label: 'Tax',              to: '/tax',             icon: Percent },
    ],
  },
  {
    id: 'catalog',
    label: 'Product catalog',
    items: [
      { label: 'Meters',   to: '/meters',  icon: Gauge },
      { label: 'Products', to: '/products', icon: Package },
      { label: 'Pricing',  to: '/pricing',  icon: Tag },
      { label: 'Plans',    to: '/plans',    icon: Layers },
    ],
  },
  {
    id: 'developers',
    label: 'Developers',
    items: [
      { label: 'API keys',        to: '/api-keys',      icon: KeyRound },
      { label: 'Events',          to: '/events',        icon: Zap },
      { label: 'Webhooks',        to: '/webhooks',      icon: Webhook },
      { label: 'Developer tools', to: '/developer',     icon: Terminal },
      { label: 'Alerts',          to: '/alerts',        icon: TriangleAlert },
      { label: 'Notifications',   to: '/notifications', icon: Bell },
      { label: 'Feature flags',   to: '/feature-flags', icon: Flag },
      { label: 'Jobs',            to: '/jobs',          icon: Cog },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { label: 'Organizations', to: '/organizations', icon: Building2 },
      { label: 'Team',          to: '/team',          icon: UserCog },
      { label: 'Audit log',     to: '/audit',         icon: ScrollText },
      { label: 'Settings',      to: '/settings',      icon: Settings },
      { label: 'Admin',         to: '/admin',         icon: Shield, superAdminOnly: true },
    ],
  },
];

const PAGE_TITLES = NAV_GROUPS.flatMap(g => g.items).reduce((acc, item) => {
  acc[item.to] = item.label;
  return acc;
}, {
  '/customers/new': 'New customer',
  '/meters/new': 'New meter',
  '/organizations/new': 'New organization',
  '/sessions': 'Sessions',
  '/verify-email': 'Verify email',
});

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return [dark, setDark];
}

function openCommandPalette() {
  document.dispatchEvent(new CustomEvent('llah:command-palette'));
}

function OrgSwitcher({ collapsed }) {
  const [orgs, setOrgs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('llah_access_token');
        if (!token) return;
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000/v1'}/organizations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        const list = json?.data?.organizations || json?.data || [];
        if (Array.isArray(list)) {
          setOrgs(list);
          const savedId = localStorage.getItem('current_organization_id');
          const found = list.find(o => o.id === savedId) || list[0];
          if (found) {
            setCurrent(found);
            if (!savedId && found.id) localStorage.setItem('current_organization_id', found.id);
          }
        }
      } catch {
        // non-critical
      }
    }
    load();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function switchOrg(org) {
    localStorage.setItem('current_organization_id', org.id);
    setOpen(false);
    window.location.reload();
  }

  return (
    <div className="relative px-3 pb-3" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface transition-colors ${
          collapsed ? 'justify-center px-0' : ''
        }`}
        aria-label="Switch organization"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[11px] font-semibold text-white flex-shrink-0">
          {(current?.name || 'O').charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-[13px] font-medium text-ink">
              {current?.name || 'Select organization'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted flex-shrink-0" />
          </>
        )}
      </button>
      {open && orgs.length > 0 && (
        <div className="dropdown top-full mt-1 left-3 right-3">
          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => switchOrg(org)}
              className={`dropdown-item ${current?.id === org.id ? 'font-medium' : ''}`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarNav({ collapsed, user, onNavigate }) {
  const location = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nav_groups_collapsed') || '{}');
    } catch {
      return {};
    }
  });

  function toggleGroup(id) {
    setCollapsedGroups(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('nav_groups_collapsed', JSON.stringify(next));
      return next;
    });
  }

  return (
    <nav className="flex-1 overflow-y-auto py-1 px-3 scrollbar-none">
      <div className="space-y-5">
        {NAV_GROUPS.map(group => {
          const items = group.items.filter(item => !item.superAdminOnly || user?.isSuperAdmin);
          if (items.length === 0) return null;
          const isGroupOpen = collapsed || !collapsedGroups[group.id];
          const hasActive = items.some(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'));

          return (
            <div key={group.id}>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted hover:text-ink"
                >
                  {group.label}
                  <ChevronRight className={`h-3 w-3 transition-transform ${isGroupOpen ? 'rotate-90' : ''} ${hasActive && !isGroupOpen ? 'text-accent' : ''}`} />
                </button>
              )}
              {isGroupOpen && (
                <div className="space-y-0.5">
                  {items.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                        }
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [dark, setDark] = useDarkMode();
  const isTestMode = localStorage.getItem('llah_test_mode') === 'true';

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function toggleSidebar() {
    setCollapsed(v => {
      localStorage.setItem('sidebar_collapsed', String(!v));
      return !v;
    });
  }

  async function handleLogout() {
    try {
      const refreshToken = localStorage.getItem('llah_refresh_token');
      if (refreshToken) {
        await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000/v1'}/auth/logout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('llah_access_token')}`,
            },
            body: JSON.stringify({ refreshToken }),
          }
        );
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      logout();
      nav('/login');
    }
  }

  const showEmailBanner = user && !user.emailVerified && !dismissedBanner;
  const desktopWidth = collapsed ? 64 : 244;
  const pageTitle = useMemo(() => {
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    const match = Object.keys(PAGE_TITLES)
      .filter(k => k.includes(':') === false && location.pathname.startsWith(k + '/'))
      .sort((a, b) => b.length - a.length)[0];
    return PAGE_TITLES[match] || '';
  }, [location.pathname]);

  const sidebarInner = (
    <>
      <div className="h-[52px] flex items-center justify-between px-4 flex-shrink-0">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-ink text-[11px] font-bold text-white">
              L
            </span>
            <span className="text-[14px] font-semibold text-ink tracking-tight">Llah</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="btn-icon btn-sm hidden lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="btn-icon btn-sm lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <OrgSwitcher collapsed={collapsed && !mobileOpen} />

      {!collapsed && (
        <div className="px-3 pb-3">
          <button
            onClick={openCommandPalette}
            className="w-full flex items-center gap-2 px-2.5 h-8 text-[13px] text-muted bg-surface rounded-md border border-line hover:border-line-strong transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="text-[10px] font-mono text-muted bg-canvas-subtle border border-line rounded px-1 py-0.5">
              {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}K
            </kbd>
          </button>
        </div>
      )}

      <SidebarNav
        collapsed={collapsed && !mobileOpen}
        user={user}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="border-t border-line p-3 flex-shrink-0">
        <Dropdown
          align="left"
          trigger={
            <button
              className={`w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface transition-colors ${
                collapsed && !mobileOpen ? 'justify-center px-0' : ''
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white flex-shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {!(collapsed && !mobileOpen) && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[11px] text-muted truncate">{user?.email}</p>
                </div>
              )}
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-line">
            <p className="text-sm font-medium text-ink truncate">{user?.email}</p>
          </div>
          <DropdownItem icon={Settings} onClick={() => nav('/settings')}>Settings</DropdownItem>
          <DropdownItem icon={Monitor} onClick={() => nav('/sessions')}>Sessions</DropdownItem>
          {!user?.emailVerified && (
            <DropdownItem icon={Mail} onClick={() => nav('/verify-email')}>Verify email</DropdownItem>
          )}
          <DropdownSeparator />
          <DropdownItem icon={LogOut} danger onClick={handleLogout}>Sign out</DropdownItem>
        </Dropdown>
      </div>
    </>
  );

  return (
    <div className="llah-shell min-h-screen bg-canvas" style={{ '--app-sidebar': `${desktopWidth}px` }}>
      <CommandPalette />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-canvas-overlay lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 bg-sidebar border-r border-line flex flex-col z-50 transition-transform duration-200 lg:translate-x-0 lg:z-30 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: mobileOpen ? 244 : desktopWidth }}
      >
        {sidebarInner}
      </aside>

      <header className="llah-topbar fixed top-0 right-0 left-0 z-20 h-[52px] bg-canvas/95 border-b border-line flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="btn-icon btn-sm"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-ink truncate">{pageTitle || 'Llah'}</span>
        </div>
        <div className="hidden lg:flex items-center min-w-0">
          <span className="text-[13px] text-muted truncate">{pageTitle}</span>
        </div>
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            onClick={openCommandPalette}
            className="btn-icon btn-sm lg:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDark(v => !v)}
            className="btn-icon btn-sm"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="btn-icon btn-sm" aria-label="Notifications" onClick={() => nav('/notifications')}>
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="llah-main min-h-screen pt-[52px]">
        {isTestMode && (
          <div className="bg-warning-muted border-b border-warning/20 px-4 lg:px-8 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-warning">Test mode — data is not live</span>
            <button
              onClick={() => { localStorage.removeItem('llah_test_mode'); window.location.reload(); }}
              className="text-xs font-medium text-warning hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {showEmailBanner && (
          <div className="bg-warning-muted border-b border-warning/15 px-4 lg:px-8 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Mail className="h-4 w-4 text-warning flex-shrink-0" />
              <span className="text-sm text-ink truncate">
                Verify your email.{' '}
                <Link to="/verify-email" className="font-medium underline underline-offset-2">
                  Verify now
                </Link>
              </span>
            </div>
            <button
              onClick={() => setDismissedBanner(true)}
              className="btn-icon btn-sm text-muted"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-7 max-w-[1280px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
