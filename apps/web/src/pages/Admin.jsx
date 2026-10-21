import { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

function isAdminError(res) {
  if (res.success) return false;
  const msg = (res.error?.message || res.error?.code || '').toLowerCase();
  return msg.includes('forbidden') || msg.includes('admin') || msg.includes('unauthorized') || msg.includes('403') || msg.includes('access');
}

export default function Admin() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState(null);
  const [orgPagination, setOrgPagination] = useState({ limit: 10, offset: 0, total: 0 });
  const [userPagination, setUserPagination] = useState({ limit: 10, offset: 0, total: 0 });

  const fetchOrgs = useCallback(async () => {
    const params = new URLSearchParams({ limit: orgPagination.limit.toString(), offset: orgPagination.offset.toString() });
    const res = await api(`/admin/orgs?${params}`);
    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : (res.data?.orgs || res.data?.organizations || []);
      setOrgs(list);
      setOrgPagination(prev => ({ ...prev, total: res.meta?.total ?? res.data?.total ?? list.length }));
    }
  }, [orgPagination.limit, orgPagination.offset]);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({ limit: userPagination.limit.toString(), offset: userPagination.offset.toString() });
    const res = await api(`/admin/users?${params}`);
    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      setUsers(list);
      setUserPagination(prev => ({ ...prev, total: res.meta?.total ?? res.data?.total ?? list.length }));
    }
  }, [userPagination.limit, userPagination.offset]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setForbidden(false);
      setError(null);
      const healthRes = await api('/admin/health');
      if (!healthRes.success) {
        if (isAdminError(healthRes)) { setForbidden(true); setLoading(false); return; }
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
        const list = Array.isArray(orgsRes.data) ? orgsRes.data : (orgsRes.data?.orgs || orgsRes.data?.organizations || []);
        setOrgs(list);
        setOrgPagination(prev => ({ ...prev, total: orgsRes.meta?.total ?? orgsRes.data?.total ?? list.length }));
      }
      if (usersRes.success) {
        const list = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []);
        setUsers(list);
        setUserPagination(prev => ({ ...prev, total: usersRes.meta?.total ?? usersRes.data?.total ?? list.length }));
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => { if (!loading && !forbidden && !error) fetchOrgs(); }, [orgPagination.offset]);
  useEffect(() => { if (!loading && !forbidden && !error) fetchUsers(); }, [userPagination.offset]);

  if (forbidden) {
    return (
      <>
        <PageHeader title="Admin dashboard" description="Super-admin system overview" />
        <div className="card p-12 text-center">
          <Shield className="h-12 w-12 text-muted mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-ink mb-2">Admin access required</h2>
          <p className="text-sm text-muted">This page is restricted to platform administrators.</p>
          <button onClick={() => window.history.back()} className="btn-secondary mt-4">Go back</button>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Admin dashboard" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Admin dashboard" />
        <div className="card p-8 text-center">
          <div className="text-danger mb-2">{error}</div>
          <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
        </div>
      </>
    );
  }

  const dbOk = health?.db === 'ok' || health?.database === 'ok' || health?.status === 'ok';

  const orgColumns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'slug', header: 'Slug', mono: true, render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'memberCount', header: 'Members', render: (v, row) => <span className="tabular-nums">{v ?? row._count?.members ?? '—'}</span>, align: 'right' },
    { key: 'customerCount', header: 'Customers', render: (v, row) => <span className="tabular-nums">{v ?? row._count?.customers ?? '—'}</span>, align: 'right' },
    { key: 'createdAt', header: 'Created', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
  ];

  const userColumns = [
    { key: 'email', header: 'Email', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'name', header: 'Name', render: (v, row) => v || [row.firstName, row.lastName].filter(Boolean).join(' ') || '—', cellClassName: 'cell-muted' },
    { key: 'orgCount', header: 'Orgs', render: (v, row) => <span className="tabular-nums">{v ?? row._count?.memberships ?? '—'}</span>, align: 'right' },
    { key: 'createdAt', header: 'Created', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader title="Admin dashboard" description="Super-admin system overview" />

      <div className="space-y-6">
        {/* Health */}
        <div className="card">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">System health</h2></div>
          <div className="card-body grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${dbOk ? 'bg-success' : 'bg-danger'}`} />
              <span className="text-muted">Database: <span className={`font-medium ${dbOk ? 'text-success' : 'text-danger'}`}>{health?.db || health?.database || health?.status || 'unknown'}</span></span>
            </div>
            <div className="text-muted">Active subs: <span className="font-medium text-ink">{health?.activeSubscriptions ?? health?.active_subscriptions ?? '—'}</span></div>
            <div className="text-muted">Pending jobs: <span className="font-medium text-ink">{health?.pendingJobs ?? health?.pending_jobs ?? '—'}</span></div>
            <div className="text-muted">Failed deliveries: <span className="font-medium text-ink">{health?.failedDeliveries ?? health?.failed_deliveries ?? '—'}</span></div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total orgs" value={stats.totalOrgs ?? stats.orgs ?? '—'} />
            <StatCard label="Total users" value={stats.totalUsers ?? stats.users ?? '—'} />
            <StatCard label="Total customers" value={stats.totalCustomers ?? stats.customers ?? '—'} />
            <StatCard label="Total subscriptions" value={stats.totalSubscriptions ?? stats.subscriptions ?? '—'} />
            <StatCard label="Total invoices" value={stats.totalInvoices ?? stats.invoices ?? '—'} />
          </div>
        )}

        {/* Orgs table */}
        <div className="card">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">All organizations</h2></div>
          <DataTable columns={orgColumns} data={orgs} emptyState={<EmptyState icon={Shield} title="No organizations" description="" />} />
          {orgPagination.total > orgPagination.limit && (
            <TablePagination offset={orgPagination.offset} limit={orgPagination.limit} total={orgPagination.total} onPageChange={offset => setOrgPagination(prev => ({ ...prev, offset }))} />
          )}
        </div>

        {/* Users table */}
        <div className="card">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">All users</h2></div>
          <DataTable columns={userColumns} data={users} emptyState={<EmptyState icon={Shield} title="No users" description="" />} />
          {userPagination.total > userPagination.limit && (
            <TablePagination offset={userPagination.offset} limit={userPagination.limit} total={userPagination.total} onPageChange={offset => setUserPagination(prev => ({ ...prev, offset }))} />
          )}
        </div>
      </div>
    </>
  );
}
