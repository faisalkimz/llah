import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

function StatCard({ label, value, sub }) {
  return (
    <div className="llah-card p-5">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-semibold text-ink">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

function fmt(amountMinor) {
  const n = typeof amountMinor === 'bigint' ? Number(amountMinor) : Number(amountMinor || 0);
  return '$' + (n / 100).toFixed(2);
}

function buildDateRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  return {
    to: to.toISOString(),
    from: from.toISOString(),
  };
}

export default function Revenue() {
  const organizationId = localStorage.getItem('current_organization_id');

  const [stats, setStats] = useState(null);
  const [churn, setChurn] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (organizationId) {
      loadAll();
    } else {
      setLoading(false);
    }
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

      if (!statsRes.success) {
        throw new Error(statsRes.error?.message || 'Failed to load revenue stats');
      }

      setStats(statsRes.data);

      if (churnRes.success) {
        setChurn(churnRes.data);
      }

      if (periodsRes.success) {
        const list = Array.isArray(periodsRes.data) ? periodsRes.data : [];
        setPeriods(list);
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
        <PageHeader title="Revenue Analytics" description="Monitor your revenue performance" />
        <div className="llah-card p-8 text-center">
          <div className="text-muted mb-2">No organization selected</div>
          <p className="text-sm text-muted-foreground">
            Select an organization to view revenue analytics.
          </p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Revenue Analytics" description="Monitor your revenue performance" />
        <div className="p-8 text-center text-muted">Loading revenue data...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Revenue Analytics" description="Monitor your revenue performance" />
        <div className="p-8 text-center">
          <div className="text-destructive mb-2">Error: {error}</div>
          <button onClick={loadAll} className="btn-secondary">
            Retry
          </button>
        </div>
      </>
    );
  }

  // Compute max revenue value for bar chart scaling
  const maxPeriodRevenue = periods.reduce((max, p) => {
    const val = Number(p.revenueMinor ?? p.revenue ?? 0);
    return val > max ? val : max;
  }, 1); // avoid division by zero

  return (
    <>
      <PageHeader title="Revenue Analytics" description="Monitor your revenue performance" />

      {/* Primary stat cards — MRR, ARR, Total Revenue */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard
          label="MRR"
          value={fmt(stats?.mrr)}
          sub="Monthly Recurring Revenue"
        />
        <StatCard
          label="ARR"
          value={fmt(stats?.arr)}
          sub="Annual Recurring Revenue"
        />
        <StatCard
          label="Total Revenue"
          value={fmt(stats?.totalRevenue)}
          sub="All time"
        />
      </div>

      {/* Churn card */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Churn Rate"
          value={
            churn != null
              ? (typeof churn.churnRate === 'number'
                  ? churn.churnRate.toFixed(2) + '%'
                  : String(churn.churnRate ?? '—'))
              : '—'
          }
          sub="Last 30 days"
        />
      </div>

      {/* Revenue by period table */}
      <div className="llah-card">
        <div className="p-4 border-b border-border font-medium">Revenue — Last 6 Months</div>

        {periods.length === 0 ? (
          <div className="p-8 text-center text-muted">No revenue data available for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Period</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground w-48">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period, idx) => {
                  const raw = Number(period.revenueMinor ?? period.revenue ?? 0);
                  const pct = maxPeriodRevenue > 0 ? (raw / maxPeriodRevenue) * 100 : 0;
                  const label =
                    period.period ||
                    period.label ||
                    (period.startDate
                      ? new Date(period.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : `Period ${idx + 1}`);

                  return (
                    <tr key={idx} className="border-t border-border hover:bg-muted/10">
                      <td className="p-3 text-sm text-muted-foreground">{label}</td>
                      <td className="p-3 text-sm font-medium">{fmt(raw)}</td>
                      <td className="p-3">
                        <div className="w-full bg-neutral-100 rounded h-2">
                          <div
                            className="bg-primary h-2 rounded"
                            style={{ width: pct + '%' }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
