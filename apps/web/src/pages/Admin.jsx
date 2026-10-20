import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

// ── helpers ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div className="llah-card p-5 flex flex-col gap-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold text-ink">
        {value ?? <span className="text-muted">—</span>}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function HealthDot({ ok }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full mr-1.5 ${
        ok ? 'bg-green-500' : 'bg-red-500'
      }`}
    />
  );
}

function isAdminError(res) {
  if (res.success) return false;
  const msg = (res.error?.message || res.error?.code || '').toLowerCase();
  return (
    msg.includes('forbidden') ||
    msg.includes('admin') ||
    msg.includes('unauthorized') ||
    msg.includes('403') ||
    msg.includes('access')
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function Admin() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState(null);

  // pagination for orgs table
  const [orgPagination, setOrgPagination] = useState({ limit: 10, offset: 0, total: 0 });
  // pagination for users table
  const [userPagination, setUserPagination] = useState({ limit: 10, offset: 0, total: 0 });

  const fetchOrgs = useCallback(async () => {
    const params = new URLSearchParams({
      limit: orgPagination.limit.toString(),
      offset: orgPagination.offset.toString(),
    });
    const res = await api(`/admin/orgs?${params}`);
    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : res.data?.orgs || res.data?.organizations || [];
      setOrgs(list);
      setOrgPagination((prev) => ({
        ...prev,
        total: res.meta?.total ?? res.data?.total ?? list.length,
      }));
    }
  }, [orgPagination.limit, orgPagination.offset]);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({
      limit: userPagination.limit.toString(),
      offset: userPagination.offset.toString(),
    });
    const res = await api(`/admin/users?${params}`);
    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : res.data?.users || [];
      setUsers(list);
      setUserPagination((prev) => ({
        ...prev,
        total: res.meta?.total ?? res.data?.total ?? list.length,
      }));
    }
  }, [userPagination.limit, userPagination.offset]);

  // Initial load — health check first, then everything in parallel
  useEffect(() => {
    async function init() {
      setLoading(true);
      setForbidden(false);
      setError(null);

      const healthRes = await api('/admin/health');
      if (!healthRes.success) {
        if (isAdminError(healthRes)) {
          setForbidden(true);
          setLoading(false);
          return;
        }
        setError(healthRes.error?.message || 'Failed to load admin data');
        setLoading(false);
        return;
      }
      setHealth(healthRes.data);

      const [statsRes, orgsRes, usersRes] = await Promise.all([
        api('/admin/stats'),
        api('/admin/orgs?limit=10&offset=0'),
        api('/admin/users?limit=10&offset=0'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (orgsRes.success) {
        const list = Array.isArray(orgsRes.data)
          ? orgsRes.data
          : orgsRes.data?.orgs || orgsRes.data?.organizations || [];
        setOrgs(list);
        setOrgPagination((prev) => ({
          ...prev,
          total: orgsRes.meta?.total ?? orgsRes.data?.total ?? list.length,
        }));
      }
      if (usersRes.success) {
        const list = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data?.users || [];
        setUsers(list);
        setUserPagination((prev) => ({
          ...prev,
          total: usersRes.meta?.total ?? usersRes.data?.total ?? list.length,
        }));
      }

      setLoading(false);
    }
    init();
  }, []);

  // Re-fetch tables when pagination changes (after initial load)
  useEffect(() => {
    if (!loading && !forbidden && !error) {
      fetchOrgs();
    }
  }, [orgPagination.offset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && !forbidden && !error) {
      fetchUsers();
    }
  }, [userPagination.offset]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── forbidden ─────────────────────────────────────────────────────────────
  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-ink mb-2">
          Admin access required
        </h2>
        <p className="text-muted-foreground max-w-sm">
          This page is restricted to platform administrators.
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn-secondary mt-6"
        >
          ← Go back
        </button>
      </div>
    );
  }

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <PageHeader
          title="Admin Dashboard"
          description="Super-admin system overview"
        />
        <div className="p-8 text-center text-muted">Loading admin data…</div>
      </>
    );
  }

  // ── error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <PageHeader
          title="Admin Dashboard"
          description="Super-admin system overview"
        />
        <div className="p-8 text-center">
          <div className="text-red-600 mb-2">Error: {error}</div>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Retry
          </button>
        </div>
      </>
    );
  }

  const dbOk = health?.db === 'ok' || health?.database === 'ok' || health?.status === 'ok';
  const orgTotal = Math.ceil(orgPagination.total / orgPagination.limit);
  const orgPage = Math.floor(orgPagination.offset / orgPagination.limit) + 1;
  const userTotal = Math.ceil(userPagination.total / userPagination.limit);
  const userPage = Math.floor(userPagination.offset / userPagination.limit) + 1;

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Super-admin system overview"
      />

      <div className="space-y-6">
        {/* Health card */}
        <div className="llah-card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">System Health</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <HealthDot ok={dbOk} />
              <span className="text-muted-foreground">
                Database:{' '}
                <span className={dbOk ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                  {health?.db || health?.database || health?.status || 'unknown'}
                </span>
              </span>
            </div>
            <div className="text-muted-foreground">
              Active subscriptions:{' '}
              <span className="font-medium text-ink">
                {health?.activeSubscriptions ?? health?.active_subscriptions ?? '—'}
              </span>
            </div>
            <div className="text-muted-foreground">
              Pending jobs:{' '}
              <span className="font-medium text-ink">
                {health?.pendingJobs ?? health?.pending_jobs ?? '—'}
              </span>
            </div>
            <div className="text-muted-foreground">
              Failed deliveries:{' '}
              <span className="font-medium text-ink">
                {health?.failedDeliveries ?? health?.failed_deliveries ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* System stats */}
        {stats && (
          <div>
            <h2 className="text-sm font-semibold text-ink mb-3">System Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                label="Total Orgs"
                value={stats.totalOrgs ?? stats.orgs ?? '—'}
              />
              <StatCard
                label="Total Users"
                value={stats.totalUsers ?? stats.users ?? '—'}
              />
              <StatCard
                label="Total Customers"
                value={stats.totalCustomers ?? stats.customers ?? '—'}
              />
              <StatCard
                label="Total Subscriptions"
                value={stats.totalSubscriptions ?? stats.subscriptions ?? '—'}
              />
              <StatCard
                label="Total Invoices"
                value={stats.totalInvoices ?? stats.invoices ?? '—'}
              />
            </div>
          </div>
        )}

        {/* All orgs table */}
        <div className="llah-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink">All Organizations</h2>
          </div>
          {orgs.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No organizations found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Slug</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Members</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Customers</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map((org) => (
                      <tr key={org.id} className="border-t border-border hover:bg-muted/10">
                        <td className="p-3 font-medium text-ink">{org.name}</td>
                        <td className="p-3 font-mono text-muted-foreground">{org.slug || '—'}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {org.memberCount ?? org._count?.members ?? '—'}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {org.customerCount ?? org._count?.customers ?? '—'}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {org.createdAt
                            ? new Date(org.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Orgs pagination */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {orgPagination.offset + 1}–
                  {Math.min(orgPagination.offset + orgPagination.limit, orgPagination.total)}{' '}
                  of {orgPagination.total} organizations
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setOrgPagination((prev) => ({
                        ...prev,
                        offset: Math.max(0, prev.offset - prev.limit),
                      }))
                    }
                    disabled={orgPagination.offset === 0}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {orgPage} of {orgTotal || 1}
                  </span>
                  <button
                    onClick={() =>
                      setOrgPagination((prev) => ({
                        ...prev,
                        offset: prev.offset + prev.limit,
                      }))
                    }
                    disabled={
                      orgPagination.offset + orgPagination.limit >= orgPagination.total
                    }
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* All users table */}
        <div className="llah-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink">All Users</h2>
          </div>
          {users.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No users found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Orgs</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-border hover:bg-muted/10">
                        <td className="p-3 text-ink">{user.email}</td>
                        <td className="p-3 text-muted-foreground">
                          {user.name || user.firstName
                            ? [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                              user.name
                            : '—'}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {user.orgCount ?? user._count?.memberships ?? '—'}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Users pagination */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {userPagination.offset + 1}–
                  {Math.min(
                    userPagination.offset + userPagination.limit,
                    userPagination.total
                  )}{' '}
                  of {userPagination.total} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setUserPagination((prev) => ({
                        ...prev,
                        offset: Math.max(0, prev.offset - prev.limit),
                      }))
                    }
                    disabled={userPagination.offset === 0}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {userPage} of {userTotal || 1}
                  </span>
                  <button
                    onClick={() =>
                      setUserPagination((prev) => ({
                        ...prev,
                        offset: prev.offset + prev.limit,
                      }))
                    }
                    disabled={
                      userPagination.offset + userPagination.limit >= userPagination.total
                    }
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
