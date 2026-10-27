import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { api } from '../lib/api';
import { useRealtimeFeed } from '../lib/ws.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton.jsx';
import { Building2, CheckCircle2, AlertTriangle, Radio, Trash2 } from 'lucide-react';

function fmt(minor) {
  const n = typeof minor === 'bigint' ? Number(minor) : Number(minor || 0);
  return (n / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function buildDateRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  return { from: from.toISOString(), to: to.toISOString() };
}

function RevenueChart({ periods }) {
  if (!periods.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted text-sm">
        No revenue data for this period.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={periods} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--color-accent)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${(v / 100).toLocaleString()}`}
        />
        <Tooltip
          formatter={(v) => [fmt(v), 'Revenue']}
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenueMinor"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="url(#revenueGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const organizationId = localStorage.getItem('current_organization_id');
  const nav = useNavigate();

  const [stats, setStats] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [openInvoicesCount, setOpenInvoicesCount] = useState(0);
  const [failedPaymentsCount, setFailedPaymentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (organizationId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [organizationId]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const { from, to } = buildDateRange();

      const [
        statsRes,
        periodsRes,
        recentInvRes,
        recentCustRes,
        openInvRes,
        failedPayRes,
      ] = await Promise.all([
        api('/revenue/stats'),
        api(`/revenue/by-period?granularity=month&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
        api('/invoices?limit=5'),
        api('/customers?limit=5&sortBy=createdAt&sortOrder=desc'),
        api('/invoices?status=OPEN&limit=1'),
        api('/payments?status=FAILED&limit=1'),
      ]);

      if (statsRes.success) setStats(statsRes.data);

      if (periodsRes.success) {
        const list = Array.isArray(periodsRes.data) ? periodsRes.data : [];
        const normalized = list.map((p, idx) => ({
          ...p,
          revenueMinor: Number(p.revenueMinor ?? p.revenue ?? 0),
          label: p.period || p.label || (p.startDate
            ? new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            : `M${idx + 1}`),
        }));
        setPeriods(normalized);
      }

      if (recentInvRes.success) {
        const list = Array.isArray(recentInvRes.data) ? recentInvRes.data : (recentInvRes.data?.invoices || []);
        setRecentInvoices(list.slice(0, 5));
      }

      if (recentCustRes.success) {
        const list = recentCustRes.data?.customers || (Array.isArray(recentCustRes.data) ? recentCustRes.data : []);
        setRecentCustomers(list.slice(0, 5));
      }

      if (openInvRes.success) {
        setOpenInvoicesCount(openInvRes.data?.total ?? (Array.isArray(openInvRes.data) ? openInvRes.data.length : 0));
      }

      if (failedPayRes.success) {
        setFailedPaymentsCount(failedPayRes.data?.total ?? (Array.isArray(failedPayRes.data) ? failedPayRes.data.length : 0));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (!organizationId) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={Building2}
          title="No organization selected"
          description="Select or create an organization to view your dashboard."
          action={<Link to="/organizations" className="btn-primary">Go to organizations</Link>}
        />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTable rows={5} columns={4} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="card p-8 text-center">
          <div className="text-danger mb-2">Failed to load dashboard</div>
          <button onClick={loadDashboard} className="btn-secondary">Retry</button>
        </div>
      </>
    );
  }

  const needsAttention = openInvoicesCount > 0 || failedPaymentsCount > 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your billing platform"
        action={<Link to="/revenue" className="btn-secondary">View reports</Link>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="MRR"
          value={fmt(stats?.mrr)}
          sub="Monthly recurring revenue"
        />
        <StatCard
          label="ARR"
          value={fmt(stats?.arr)}
          sub="Annual recurring revenue"
        />
        <StatCard
          label="Open invoices"
          value={openInvoicesCount}
        />
        <StatCard
          label="Failed payments"
          value={failedPaymentsCount}
        />
      </div>

      {/* Revenue chart */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-ink">Revenue — last 6 months</h2>
        </div>
        <div className="p-4">
          <RevenueChart periods={periods} />
        </div>
      </div>

      {/* Needs attention + recent rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Needs attention */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-ink">Needs attention</h2>
          </div>
          <div className="card-body space-y-3">
            {!needsAttention ? (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Everything looks good
              </div>
            ) : (
              <>
                {openInvoicesCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      {openInvoicesCount} open invoice{openInvoicesCount !== 1 ? 's' : ''}
                    </div>
                    <Link to="/invoices" className="text-xs text-accent hover:underline">View</Link>
                  </div>
                )}
                {failedPaymentsCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-danger">
                      <AlertTriangle className="h-4 w-4" />
                      {failedPaymentsCount} failed payment{failedPaymentsCount !== 1 ? 's' : ''}
                    </div>
                    <Link to="/payments" className="text-xs text-accent hover:underline">View</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recent invoices */}
        <div className="card lg:col-span-1">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent invoices</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-muted">No invoices yet</td>
                  </tr>
                ) : recentInvoices.map(inv => (
                  <tr
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() => nav('/invoices')}
                  >
                    <td className="cell-mono">{inv.number || inv.id?.slice(0, 8)}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td className="text-right tabular-nums">{fmt(inv.totalAmountMinor ?? inv.totalMinor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <Link to="/invoices" className="text-xs text-accent hover:underline">View all invoices</Link>
          </div>
        </div>

        {/* Recent customers */}
        <div className="card lg:col-span-1">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-ink">Recent customers</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-6 text-muted">No customers yet</td>
                  </tr>
                ) : recentCustomers.map(c => (
                  <tr
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => nav(`/customers/${c.id}`)}
                  >
                    <td className="font-medium">{c.name}</td>
                    <td className="cell-muted">{c.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <Link to="/customers" className="text-xs text-accent hover:underline">View all customers</Link>
          </div>
        </div>
      </div>

      {/* Real-time Usage Feed */}
      <RealtimeFeed organizationId={organizationId} />
    </>
  );
}

function RealtimeFeed({ organizationId }) {
  const { events, connected, clearEvents } = useRealtimeFeed({ orgId: organizationId });

  return (
    <div className="card mt-6">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-muted" strokeWidth={1.5} />
          <h3 className="font-semibold text-ink">Real-time usage feed</h3>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            connected ? 'text-success' : 'text-muted'
          }`}>
            <span className={`h-2 w-2 rounded-full ${
              connected ? 'bg-success animate-pulse' : 'bg-muted'
            }`} />
            {connected ? 'Live' : 'Connecting...'}
          </span>
        </div>
        {events.length > 0 && (
          <button
            onClick={clearEvents}
            className="btn-icon btn-sm text-muted hover:text-danger"
            title="Clear feed"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            {connected
              ? 'Waiting for usage events... Send events via the API to see them appear here in real time.'
              : 'Connecting to real-time feed...'}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {events.map((evt, idx) => (
              <div key={evt.data?.id || idx} className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-canvas-subtle">
                <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-ink">{evt.type}</span>
                  {evt.data?.customerId && (
                    <span className="text-muted ml-2">customer: <span className="font-mono text-xs">{evt.data.customerId.slice(0, 12)}…</span></span>
                  )}
                  {evt.data?.meterId && (
                    <span className="text-muted ml-2">meter: <span className="font-mono text-xs">{evt.data.meterId}</span></span>
                  )}
                  {evt.data?.quantity != null && (
                    <span className="text-muted ml-2">qty: <span className="font-semibold text-ink">{evt.data.quantity}</span></span>
                  )}
                </div>
                <span className="text-xs text-muted tabular-nums flex-shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
