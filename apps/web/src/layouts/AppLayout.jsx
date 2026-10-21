import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import CommandPalette from '../components/ui/CommandPalette.jsx';
import Dropdown, { DropdownItem, DropdownSeparator } from '../components/ui/Dropdown.jsx';
import {
  BarChart3, Gauge, DollarSign, FileText, Activity,
  Users, Database, Tag, CreditCard, RefreshCw, Receipt, Clock, Sliders, Percent,
  Code2, Bell, Flag,
  Shield, Settings,
  Search, LogOut, Monitor, Mail,
  PanelLeftClose, PanelLeft,
  Building2, Sun, Moon, Wrench, Terminal, AlertTriangle,
  ChevronDown, GitBranch
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',     to: '/dashboard',     icon: BarChart3 },
      { label: 'Usage',         to: '/usage',         icon: Gauge },
      { label: 'Revenue',       to: '/revenue',       icon: DollarSign },
      { label: 'Reports',       to: '/reports',       icon: FileText },
      { label: 'Observability', to: '/observability', icon: Activity },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Customers',       to: '/customers',       icon: Users },
      { label: 'Meters',          to: '/meters',          icon: Gauge },
      { label: 'Products',        to: '/products',        icon: Database },
      { label: 'Pricing',         to: '/pricing',         icon: Tag },
      { label: 'Plans',           to: '/plans',           icon: Sliders },
      { label: 'Subscriptions',   to: '/subscriptions',   icon: RefreshCw },
      { label: 'Invoices',        to: '/invoices',        icon: Receipt },
      { label: 'Payments',        to: '/payments',        icon: CreditCard },
      { label: 'Credits',         to: '/credits',         icon: DollarSign },
      { label: 'Billing periods', to: '/billing-periods', icon: Clock },
      { label: 'Adjustments',     to: '/adjustments',     icon: Sliders },
      { label: 'Refunds',         to: '/refunds',         icon: RefreshCw },
      { label: 'Coupons',         to: '/coupons',         icon: Percent },
      { label: 'Tax',             to: '/tax',             icon: Receipt },
    ],
  },
  {
    label: 'Developers',
    items: [
      { label: 'API keys',        to: '/api-keys',        icon: Code2 },
      { label: 'Events',          to: '/events',          icon: Terminal },
      { label: 'Webhooks',        to: '/webhooks',        icon: GitBranch },
      { label: 'Developer tools', to: '/developer',       icon: Wrench },
      { label: 'Alerts',          to: '/alerts',          icon: AlertTriangle },
      { label: 'Notifications',   to: '/notifications',   icon: Bell },
      { label: 'Feature flags',   to: '/feature-flags',   icon: Flag },
      { label: 'Jobs',            to: '/jobs',            icon: Activity },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Organizations', to: '/organizations', icon: Building2 },
      { label: 'Audit log',     to: '/audit',         icon: Shield },
      { label: 'Team',          to: '/team',          icon: Users },
      { label: 'Settings',      to: '/settings',      icon: Settings },
      { label: 'Admin',         to: '/admin',         icon: Shield },
    ],
  },
];

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
          if (found) setCurrent(found);
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

  if (collapsed) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent transition-colors max-w-[180px]"
        aria-label="Switch organization"
      >
        <Building2 className="h-4 w-4 text-muted flex-shrink-0" />
        <span className="truncate">{current?.name || 'Select org'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted flex-shrink-0" />
      </button>
      {open && orgs.length > 0 && (
        <div className="dropdown top-full mt-1 left-0">
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

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [dark, setDark] = useDarkMode();
  const isTestMode = localStorage.getItem('llah_test_mode') === 'true';

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

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
  const sidebarWidth = collapsed ? 64 : 256;

  return (
    <div className="min-h-screen bg-canvas">
      <CommandPalette />

      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 border-r border-line bg-surface flex flex-col transition-all duration-200 z-30"
        style={{ width: sidebarWidth }}
      >
        {/* Logo + collapse toggle */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-line flex-shrink-0">
          {!collapsed && (
            <Link to="/dashboard" className="text-sm font-bold text-ink tracking-tight">
              Llah
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="btn-icon btn-sm"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Search trigger */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted bg-canvas-subtle rounded-md border border-line hover:border-line-strong transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="text-[10px] font-mono text-muted bg-surface border border-line rounded px-1 py-0.5">
                {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-none">
          <div className="space-y-6">
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                {!collapsed && (
                  <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                    {group.label}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-md text-[13px] transition-colors ${
                            isActive
                              ? 'border-l-2 border-accent bg-accent-muted/10 font-medium text-ink pl-[6px] pr-2 py-1.5'
                              : 'text-muted hover:bg-canvas-subtle hover:text-ink px-2 py-1.5'
                          } ${collapsed ? 'justify-center px-0 py-2' : ''}`
                        }
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User profile at bottom */}
        <div className="border-t border-line p-3 flex-shrink-0">
          <Dropdown
            align="left"
            trigger={
              <button
                className={`w-full flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-canvas-subtle transition-colors ${
                  collapsed ? 'justify-center px-0' : ''
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white flex-shrink-0">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">
                      {user?.email?.split('@')[0] || 'User'}
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
      </aside>

      {/* Top bar */}
      <header
        className="fixed top-0 right-0 z-20 h-14 bg-surface border-b border-line flex items-center justify-between px-4 transition-all duration-200"
        style={{ left: sidebarWidth }}
      >
        <OrgSwitcher collapsed={false} />
        <div className="flex items-center gap-1">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(v => !v)}
            className="btn-icon btn-sm"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {/* Notifications */}
          <button className="btn-icon btn-sm" aria-label="Notifications" onClick={() => nav('/notifications')}>
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-200"
        style={{ marginLeft: sidebarWidth, paddingTop: '56px' }}
      >
        {/* Test mode banner */}
        {isTestMode && (
          <div className="bg-warning-muted border-b border-warning/30 px-6 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-warning">Test mode active — data is not real</span>
            <button
              onClick={() => { localStorage.removeItem('llah_test_mode'); window.location.reload(); }}
              className="btn-icon btn-sm text-warning"
              aria-label="Dismiss test mode"
            >
              <span className="text-xs">Dismiss</span>
            </button>
          </div>
        )}

        {/* Email verification banner */}
        {showEmailBanner && (
          <div className="bg-warning-muted border-b border-warning/20 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-warning flex-shrink-0" />
              <span className="text-sm text-ink">
                Verify your email address.{' '}
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
