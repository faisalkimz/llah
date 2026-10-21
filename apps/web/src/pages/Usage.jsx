import { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

function truncate(str, len = 12) {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export default function Usage() {
  const organizationId = localStorage.getItem('current_organization_id');
  const [aggregates, setAggregates] = useState([]);
  const [events, setEvents] = useState([]);
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
      const [aggRes, eventsRes] = await Promise.all([
        api('/usage-aggregation?limit=20'),
        api('/usage-events?limit=20'),
      ]);
      if (!aggRes.success && !eventsRes.success) {
        throw new Error(aggRes.error?.message || eventsRes.error?.message || 'Failed to load usage data');
      }
      if (aggRes.success) setAggregates(Array.isArray(aggRes.data) ? aggRes.data : []);
      if (eventsRes.success) setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (!organizationId) {
    return (
      <>
        <PageHeader title="Usage" />
        <EmptyState icon={Gauge} title="No organization selected" description="Select an organization to view usage data." />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Usage" />
        <div className="grid grid-cols-2 gap-4 mb-6">{[0,1].map(i=><SkeletonCard key={i}/>)}</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Usage" />
        <div className="card p-8 text-center">
          <div className="text-danger mb-2">{error}</div>
          <button onClick={loadAll} className="btn-secondary">Retry</button>
        </div>
      </>
    );
  }

  const uniqueMeters = new Set(aggregates.map(a => a.meterId).filter(Boolean)).size;

  // Build chart data from events
  const chartData = events
    .filter(e => e.timestamp || e.createdAt)
    .slice(0, 20)
    .map(e => ({
      time: new Date(e.timestamp || e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      quantity: Number(e.quantity ?? 0),
    }));

  const eventColumns = [
    { key: 'id', header: 'Event ID', mono: true, render: v => truncate(v, 14) },
    { key: 'meterId', header: 'Meter ID', mono: true, render: v => truncate(v, 14) },
    { key: 'customerId', header: 'Customer', mono: true, render: v => truncate(v, 14) },
    { key: 'quantity', header: 'Quantity', render: v => <span className="tabular-nums">{v ?? '—'}</span> },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (v, row) => {
        const d = v || row.createdAt;
        return d ? new Date(d).toLocaleString() : '—';
      },
      cellClassName: 'cell-muted',
    },
  ];

  const aggColumns = [
    { key: 'meterId', header: 'Meter ID', mono: true, render: v => truncate(v, 14) },
    { key: 'periodStart', header: 'Period start', render: (v, row) => (v || row.startDate) ? new Date(v || row.startDate).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    { key: 'aggregatedValue', header: 'Value', render: (v, row) => <span className="tabular-nums">{v ?? row.value ?? '—'}</span> },
    { key: 'aggregationType', header: 'Type', render: (v, row) => v || row.type || '—', cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader title="Usage" description="Track usage events and aggregations" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total events" value={events.length} sub="Last 20 fetched" />
        <StatCard label="Unique meters" value={uniqueMeters} sub="From aggregates" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card mb-6">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">Usage over time</h2></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="quantity" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Events table */}
      <div className="card mb-6">
        <div className="card-header"><h2 className="text-sm font-semibold text-ink">Recent usage events</h2></div>
        <DataTable
          columns={eventColumns}
          data={events}
          emptyState={<EmptyState icon={Gauge} title="No usage events" description="Usage events will appear here once you start tracking usage." />}
        />
      </div>

      {/* Aggregates table */}
      <div className="card">
        <div className="card-header"><h2 className="text-sm font-semibold text-ink">Usage aggregates</h2></div>
        <DataTable
          columns={aggColumns}
          data={aggregates}
          emptyState={<EmptyState icon={Gauge} title="No aggregates" description="Aggregates will be generated after usage events are processed." />}
        />
      </div>
    </>
  );
}
