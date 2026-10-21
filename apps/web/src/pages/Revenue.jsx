import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { DollarSign } from 'lucide-react';

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

export default function Revenue() {
  const organizationId = localStorage.getItem('current_organization_id');
  const [stats, setStats] = useState(null);
  const [churn, setChurn] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (organizationId) loadAll();
    else setLoading(false);
  }, [organizationId]);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const { from, to } = buildDateRange();
      const [statsRes, churnRes, periodsRes] = await Promise.all([
        api('/revenue/stats'),
        api('/revenue/churn?last30days=true'),
        api(`/revenue/by-period?granularity=month&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
      ]);
      if (!statsRes.success) throw new Error(statsRes.error?.message || 'Failed to load revenue stats');
      setStats(statsRes.data);
      if (churnRes.success) setChurn(churnRes.data);
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
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (!organizationId) {
    return (
      <>
        <PageHeader title="Revenue analytics" />
        <EmptyState icon={DollarSign} title="No organization selected" description="Select an organization to view revenue analytics." />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Revenue analytics" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Revenue analytics" />
        <div className="card p-8 text-center">
          <div className="text-danger mb-2">{error}</div>
          <button onClick={loadAll} className="btn-secondary">Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Revenue analytics" description="Monitor your revenue performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="MRR" value={fmt(stats?.mrr)} sub="Monthly recurring revenue" />
        <StatCard label="ARR" value={fmt(stats?.arr)} sub="Annual recurring revenue" />
        <StatCard label="Total revenue" value={fmt(stats?.totalRevenue)} sub="All time" />
        <StatCard
          label="Churn rate"
          value={churn != null
            ? (typeof churn.churnRate === 'number' ? churn.churnRate.toFixed(2) + '%' : String(churn.churnRate ?? '—'))
            : '—'}
          sub="Last 30 days"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-ink">Revenue — last 6 months</h2>
        </div>
        <div className="p-4">
          {periods.length === 0 ? (
            <EmptyState icon={DollarSign} title="No revenue data" description="Revenue data will appear here once you start billing customers." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={periods} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 100).toLocaleString()}`}
                />
                <Tooltip
                  formatter={v => [fmt(v), 'Revenue']}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 6, fontSize: 12 }}
                />
                <Bar dataKey="revenueMinor" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
