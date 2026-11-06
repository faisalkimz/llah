import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../lib/api';
import { formatMoney } from '../lib/format.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import MetricStrip from '../components/ui/MetricStrip.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { DollarSign } from 'lucide-react';

function buildDateRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  return { from: from.toISOString(), to: to.toISOString() };
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-sm text-[12px]">
      <div className="text-muted mb-0.5">{label}</div>
      <div className="font-medium text-ink tabular-nums">{formatMoney(payload[0].value)}</div>
    </div>
  );
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
        <PageHeader title="Revenue" description="Recurring revenue and billed volume." />
        <EmptyState icon={DollarSign} title="No organization selected" description="Select an organization to view revenue analytics." />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Revenue" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Revenue" />
        <div className="card p-8 text-center">
          <div className="text-danger mb-2">{error}</div>
          <button onClick={loadAll} className="btn-secondary">Retry</button>
        </div>
      </>
    );
  }

  const churnLabel = churn != null
    ? (typeof churn.churnRate === 'number' ? `${churn.churnRate.toFixed(2)}%` : String(churn.churnRate ?? '—'))
    : '—';

  return (
    <>
      <PageHeader title="Revenue" description="MRR, ARR, billed volume, and churn for the last 6 months." />

      <MetricStrip
        className="mb-6"
        items={[
          { label: 'MRR', value: formatMoney(stats?.mrr), sub: 'Monthly recurring' },
          { label: 'ARR', value: formatMoney(stats?.arr), sub: 'Annualized' },
          { label: 'Total revenue', value: formatMoney(stats?.totalRevenue), sub: 'All time' },
          { label: 'Churn rate', value: churnLabel, sub: 'Last 30 days' },
        ]}
      />

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-ink">Billed volume</h2>
          <span className="text-[13px] text-muted">Last 6 months</span>
        </div>
        <div className="p-4">
          {periods.length === 0 ? (
            <EmptyState icon={DollarSign} title="No revenue data" description="Revenue appears here once customers are billed." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={periods} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={v => `$${(v / 100).toLocaleString()}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-canvas-subtle)' }} />
                <Bar dataKey="revenueMinor" fill="var(--color-chart)" radius={[3, 3, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
