import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const groups = [
  ['Overview', [
    ['Dashboard', '/dashboard'],
    ['Usage', '/usage'],
    ['Revenue', '/revenue']
  ]],
  ['Billing', [
    ['Customers', '/customers'],
    ['Meters', '/meters'],
    ['Products', '/products'],
    ['Pricing', '/pricing'],
    ['Plans', '/plans'],
    ['Subscriptions', '/subscriptions'],
    ['Invoices', '/invoices'],
    ['Payments', '/payments'],
    ['Credits', '/credits']
  ]],
  ['Developers', [
    ['API keys', '/api-keys'],
    ['Events', '/events'],
    ['Webhooks', '/webhooks'],
    ['Developer tools', '/developer']
  ]],
  ['Workspace', [
    ['Organizations', '/organizations'],
    ['Audit log', '/audit'],
    ['Settings', '/settings'],
    ['Admin', '/admin']
  ]]
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  async function handleLogout() {
    try {
      const refreshToken = localStorage.getItem('llah_refresh_token');
      if (refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/logout`, {
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

  return (
    <div className="min-h-screen bg-canvas">
      {/* Email Verification Banner */}
      {showEmailBanner && (
        <div className="bg-warning/10 border-b border-warning/20">
          <div className="mx-auto max-w-7xl px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20">
                  <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">
                    Please verify your email address
                  </p>
                  <p className="text-xs text-muted">
                    We sent a verification link to <span className="font-medium text-ink">{user.email}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link 
                  to="/verify-email"
                  className="text-sm font-medium text-ink hover:underline"
                >
                  Verify now
                </Link>
                <button
                  onClick={() => setDismissedBanner(true)}
                  className="text-muted hover:text-ink transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 border-r bg-[#fbfbfa] px-3 py-4">
        <div className="mb-5 px-2 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-ink hover:text-ink/80 transition-colors">
            Llah
          </Link>
        </div>
        
        <nav className="space-y-5">
          {groups.map(([g, items]) => (
            <div key={g}>
              <div className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                {g}
              </div>
              {items.map(([label, to]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `block rounded px-2 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-neutral-200 font-medium text-ink'
                        : 'text-muted hover:bg-neutral-100 hover:text-ink'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium text-white">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <svg
                className={`h-4 w-4 text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 z-20 rounded-lg border border-line bg-white shadow-lg py-1">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-neutral-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <Link
                    to="/sessions"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-neutral-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Sessions
                  </Link>
                  {!user?.emailVerified && (
                    <Link
                      to="/verify-email"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-neutral-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Verify email
                    </Link>
                  )}
                  <div className="my-1 border-t border-line" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 min-h-screen">
        <div className="mx-auto max-w-7xl px-8 py-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
