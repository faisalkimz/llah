import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import CommandPalette from '../components/ui/CommandPalette.jsx';
import Dropdown, { DropdownItem, DropdownSeparator } from '../components/ui/Dropdown.jsx';
import {
  BarChart3, Gauge, DollarSign, FileText, Zap,
  Users, Database, Tag, CreditCard, RefreshCw, Receipt, Clock, Hash, Percent,
  Code2, Bell, Flag,
  Shield, Settings, ChevronLeft, ChevronRight,
  Search, LogOut, User, Monitor, Mail,
  PanelLeftClose, PanelLeft,
  Building2
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',     to: '/dashboard',     icon: BarChart3 },
      { label: 'Usage',         to: '/usage',         icon: Gauge },
      { label: 'Revenue',       to: '/revenue',       icon: DollarSign },
      { label: 'Reports',       to: '/reports',       icon: FileText },
      { label: 'Observability', to: '/observability', icon: Zap },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Customers',       to: '/customers',       icon: Users },
      { label: 'Meters',          to: '/meters',          icon: Gauge },
      { label: 'Products',        to: '/products',        icon: Database },
      { label: 'Pricing',         to: '/pricing',         icon: Tag },
      { label: 'Plans',           to: '/plans',           icon: CreditCard },
      { label: 'Subscriptions',   to: '/subscriptions',   icon: RefreshCw },
      { label: 'Invoices',        to: '/invoices',        icon: Receipt },
      { label: 'Payments',        to: '/payments',        icon: CreditCard },
      { label: 'Credits',         to: '/credits',         icon: DollarSign },
      { label: 'Billing periods', to: '/billing-periods', icon: Clock },
      { label: 'Adjustments',     to: '/adjustments',     icon: Hash },
      { label: 'Refunds',         to: '/refunds',         icon: RefreshCw },
      { label: 'Coupons',         to: '/coupons',         icon: Percent },
      { label: 'Tax',             to: '/tax',             icon: Receipt },
    ],
  },
  {
    label: 'Developers',
    items: [
      { label: 'API keys',        to: '/api-keys',        icon: Code2 },
      { label: 'Events',          to: '/events',          icon: Zap },
      { label: 'Webhooks',        to: '/webhooks',        icon: Zap },
      { label: 'Developer tools', to: '/developer',       icon: Code2 },
      { label: 'Alerts',          to: '/alerts',          icon: Bell },
      { label: 'Notifications',   to: '/notifications',   icon: Bell },
      { label: 'Feature flags',   to: '/feature-flags',   icon: Flag },
      { label: 'Jobs',            to: '/jobs',            icon: Zap },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Organizations', to: '/organizations', icon: Building2 },
      { label: 'Audit log',     to: '/audit',         icon: FileText },
      { label: 'Team',          to: '/team',          icon: Users },
      { label: 'Settings',      to: '/settings',      icon: Settings },
      { label: 'Admin',         to: '/admin',         icon: Shield },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Persist sidebar state
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
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/v1'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('llah_access_token')}`
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      logout();
      nav('/login');
    }
  }

  const showEmailBanner = user && !user.emailVerified && !dismissedBanner;
  const sidebarWidth = collapsed ? 'w-16' : 'w-64';
  const mainMargin = collapsed ? 'ml-16' : 'ml-64';

  return (
    <div className="min-h-screen bg-canvas">
      {/* Command Palette */}
      <CommandPalette />

      {/* Email Verification Banner */}
      {showEmailBanner && (
        <div className="bg-warning-muted border-b border-warning/20" style={{ marginLeft: collapsed ? 64 : 256 }}>
          <div className="px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-warning flex-shrink-0" />
              <span className="text-sm text-ink">
                Verify your email address.
                {' '}
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
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 ${sidebarWidth} border-r border-line bg-surface flex flex-col transition-all duration-200 z-30`}
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
              <kbd className="text-[10px] font-mono text-muted-foreground bg-surface border border-line rounded px-1 py-0.5">
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
                  <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                          `flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                            isActive
                              ? 'bg-canvas-subtle font-medium text-ink'
                              : 'text-muted hover:bg-canvas-subtle hover:text-ink'
                          } ${collapsed ? 'justify-center px-0' : ''}`
                        }
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
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

      {/* Main Content */}
      <main className={`${mainMargin} min-h-screen transition-all duration-200`}>
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
