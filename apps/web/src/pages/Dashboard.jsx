import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const STATUS_BADGE = {
  DRAFT: 'bg-neutral-100 text-neutral-600',
  OPEN: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  VOID: 'bg-neutral-100 text-neutral-500',
  UNCOLLECTIBLE: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${STATUS_BADGE[status] || 'bg-neutral-100 text-neutral-600'}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="llah-card p-5">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-semibold text-ink">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const organizationId = localStorage.getItem('current_organization_id');

  const [stats, setStats] = useState({
    activeSubscriptions: null,
    openInvoices: null,
    totalCustomers: null,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
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

      const [subsRes, invoicesRes, customersRes, recentInvRes, recentCustRes] = await Promise.all([
        api('/subscriptions?status=ACTIVE&limit=200'),
        api('/invoices?status=OPEN&limit=200'),
        api('/customers?limit=1'),
        api('/invoices?limit=5'),
        api('/customers?limit=5&sortBy=createdAt&sortOrder=desc'),
      ]);

      setStats({
        activeSubscriptions: subsRes.success && Array.isArray(subsRes.data) ? subsRes.data.length : '—',
        openInvoices: invoicesRes.success && Array.isArray(invoicesRes.data) ? invoicesRes.data.length : '—',
        totalCustomers: customersRes.success && customersRes.data ? customersRes.data.total : '—',
      });

      if (recentInvRes.success && Array.isArray(recentInvRes.data)) {
        setRecentInvoices(recentInvRes.data.slice(0, 5));
      }
      if (recentCustRes.success && recentCustRes.data) {
        setRecentCustomers((recentCustRes.data.customers || []).slice(0, 5));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(totalMinor) {
    const cents = typeof totalMinor === 'bigint' ? Number(totalMinor) : Number(totalMinor || 0);
    return '$' + (cents / 100).toFixed(2);
  }

  if (!organizationId) {
    return (
      <>
        <PageHeader title="Dashboard" description="Overview of your billing platform" />
        <div className="llah-card p-8 text-center">
          <div className="text-muted mb-4">No organization selected</div>
          <p className="text-sm text-muted-foreground mb-4">
            Select or create an organization to view your dashboard.
          </p>
          <Link to="/organizations" className="btn-primary">
            Go to Organizations
          </Link>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Overview of your billing platform" />
        <div className="p-8 text-center text-muted">Loading dashboard...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" description="Overview of your billing platform" />
        <div className="p-8 text-center">
          <div className="text-destructive mb-2">Error: {error}</div>
          <button onClick={loadDashboard} className="btn-secondary">Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your billing platform" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Active Subscriptions"
          value={stats.activeSubscriptions ?? '—'}
        />
        <StatCard
          label="Open Invoices"
          value={stats.openInvoices ?? '—'}
        />
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers ?? '—'}
        />
        <StatCard
          label="Revenue Analytics"
          value="—"
          sub="Coming soon"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link to="/customers/new" className="btn-primary">+ New Customer</Link>
        <Link to="/invoices" className="btn-secondary">View Invoices</Link>
        <Link to="/subscriptions" className="btn-secondary">View Subscriptions</Link>
        <button disabled className="btn-secondary opacity-50 cursor-not-allowed">View Reports</button>
      </div>

      {/* Recent Invoices */}
      <div className="llah-card mb-6">
        <div className="p-4 border-b border-border font-medium">Recent Invoices</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Invoice ID</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-muted">No invoices yet</td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-border hover:bg-muted/10">
                    <td className="p-3 text-sm font-mono text-muted-foreground">{inv.id.slice(0, 8)}...</td>
                    <td className="p-3"><StatusBadge status={inv.status} /></td>
                    <td className="p-3 text-sm">{formatAmount(inv.totalMinor)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border">
          <Link to="/invoices" className="text-sm text-primary hover:underline">View all invoices →</Link>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="llah-card">
        <div className="p-4 border-b border-border font-medium">Recent Customers</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-muted">No customers yet</td>
                </tr>
              ) : (
                recentCustomers.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/10">
                    <td className="p-3">
                      <Link to={`/customers/${c.id}`} className="text-primary hover:underline font-medium">{c.name}</Link>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{c.email || '—'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border">
          <Link to="/customers" className="text-sm text-primary hover:underline">View all customers →</Link>
        </div>
      </div>
    </>
  );
}
