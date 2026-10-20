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

function truncate(str, len = 8) {
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

      const [aggRes, eventsRes] = await Promise.all([
        api('/usage-aggregation?limit=20'),
        api('/usage-events?limit=10'),
      ]);

      if (!aggRes.success && !eventsRes.success) {
        throw new Error(
          aggRes.error?.message || eventsRes.error?.message || 'Failed to load usage data'
        );
      }

      if (aggRes.success) {
        setAggregates(Array.isArray(aggRes.data) ? aggRes.data : []);
      }

      if (eventsRes.success) {
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
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
        <PageHeader title="Usage" description="Track usage events and aggregations" />
        <div className="llah-card p-8 text-center">
          <div className="text-muted mb-2">No organization selected</div>
          <p className="text-sm text-muted-foreground">
            Select an organization to view usage data.
          </p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Usage" description="Track usage events and aggregations" />
        <div className="p-8 text-center text-muted">Loading usage data...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Usage" description="Track usage events and aggregations" />
        <div className="p-8 text-center">
          <div className="text-destructive mb-2">Error: {error}</div>
          <button onClick={loadAll} className="btn-secondary">
            Retry
          </button>
        </div>
      </>
    );
  }

  // Compute stats
  const totalEvents = events.length;
  const uniqueMeters = new Set(aggregates.map((a) => a.meterId).filter(Boolean)).size;

  return (
    <>
      <PageHeader title="Usage" description="Track usage events and aggregations" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Total Events"
          value={totalEvents}
          sub="Last 10 fetched"
        />
        <StatCard
          label="Unique Meters"
          value={uniqueMeters}
          sub="From aggregates"
        />
      </div>

      {/* Recent Usage Events */}
      <div className="llah-card mb-6">
        <div className="p-4 border-b border-border font-medium">Recent Usage Events</div>

        {events.length === 0 ? (
          <div className="p-8 text-center text-muted">No usage events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Event ID
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Meter ID
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Customer ID
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Quantity
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-t border-border hover:bg-muted/10">
                    <td className="p-3 text-sm font-mono text-muted-foreground" title={ev.id}>
                      {truncate(ev.id)}
                    </td>
                    <td className="p-3 text-sm font-mono text-muted-foreground" title={ev.meterId}>
                      {truncate(ev.meterId)}
                    </td>
                    <td
                      className="p-3 text-sm font-mono text-muted-foreground"
                      title={ev.customerId}
                    >
                      {truncate(ev.customerId)}
                    </td>
                    <td className="p-3 text-sm">{ev.quantity ?? '—'}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {ev.timestamp
                        ? new Date(ev.timestamp).toLocaleString()
                        : ev.createdAt
                        ? new Date(ev.createdAt).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage Aggregates */}
      <div className="llah-card">
        <div className="p-4 border-b border-border font-medium">Usage Aggregates</div>

        {aggregates.length === 0 ? (
          <div className="p-8 text-center text-muted">No usage aggregates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Meter ID
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Period Start
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Aggregated Value
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Aggregation Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((agg, idx) => (
                  <tr key={agg.id || idx} className="border-t border-border hover:bg-muted/10">
                    <td
                      className="p-3 text-sm font-mono text-muted-foreground"
                      title={agg.meterId}
                    >
                      {truncate(agg.meterId)}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {agg.periodStart
                        ? new Date(agg.periodStart).toLocaleDateString()
                        : agg.startDate
                        ? new Date(agg.startDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3 text-sm font-medium">
                      {agg.aggregatedValue ?? agg.value ?? '—'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {agg.aggregationType ?? agg.type ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
