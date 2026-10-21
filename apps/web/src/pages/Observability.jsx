import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

function formatUptime(seconds) {
  if (seconds == null || isNaN(seconds)) return '—';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}

function toMB(bytes) {
  if (bytes == null) return '—';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Observability() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    setErrors({});
    const [healthRes, metricsRes, uptimeRes] = await Promise.all([
      api('/observability/health'),
      api('/observability/metrics'),
      api('/observability/uptime'),
    ]);
    if (healthRes.success) setHealth(healthRes.data);
    else setErrors(e => ({ ...e, health: healthRes.error?.message || 'Failed to load health' }));
    if (metricsRes.success) setMetrics(metricsRes.data);
    else {
      const msg = metricsRes.error?.message || '';
      setErrors(e => ({ ...e, metrics: msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('admin') ? 'admin' : msg || 'Failed to load metrics' }));
    }
    if (uptimeRes.success) setUptime(uptimeRes.data);
    else {
      const msg = uptimeRes.error?.message || '';
      setErrors(e => ({ ...e, uptime: msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('admin') ? 'admin' : msg || 'Failed to load uptime' }));
    }
    setLoading(false);
  }

  const dbOk = health?.database === 'ok' || health?.database?.status === 'ok' || health?.db === 'ok' || health?.status === 'ok';

  if (loading) {
    return (
      <>
        <PageHeader title="Observability" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Observability" description="Platform health and metrics" action={<button onClick={fetchAll} className="btn-secondary">Refresh</button>} />

      <div className="space-y-6">
        {/* Health */}
        <div className="card">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">System health</h2></div>
          <div className="card-body">
            {errors.health ? (
              <div className="text-sm text-danger">{errors.health}</div>
            ) : health ? (
              <div className="flex items-center gap-3 text-sm">
                <span className={`inline-block h-3 w-3 rounded-full ${dbOk ? 'bg-success' : 'bg-danger'}`} />
                <span className="text-muted">Database: <span className={`font-medium ${dbOk ? 'text-success' : 'text-danger'}`}>{dbOk ? 'Connected' : 'Unavailable'}</span></span>
                {(health.checkedAt || health.timestamp) && (
                  <span className="text-xs text-muted ml-2">Last checked: {new Date(health.checkedAt || health.timestamp).toLocaleString()}</span>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted">No health data available.</div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="card">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">Metrics</h2></div>
          <div className="card-body">
            {errors.metrics === 'admin' ? (
              <div className="text-sm text-warning">Metrics require admin access.</div>
            ) : errors.metrics ? (
              <div className="text-sm text-danger">{errors.metrics}</div>
            ) : metrics ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {metrics.apiKeys != null && <StatCard label="API keys" value={metrics.apiKeys} />}
                {metrics.webhookDeliveries && (
                  <>
                    <StatCard label="Webhooks succeeded" value={metrics.webhookDeliveries.succeeded ?? metrics.webhookDeliveries.success ?? '—'} />
                    <StatCard label="Webhooks failed" value={metrics.webhookDeliveries.failed ?? '—'} />
                    <StatCard label="Webhooks pending" value={metrics.webhookDeliveries.pending ?? '—'} />
                  </>
                )}
                {metrics.recentAuditEvents != null && <StatCard label="Recent audit events" value={metrics.recentAuditEvents} />}
              </div>
            ) : (
              <EmptyState icon={Activity} title="No metrics" description="Metrics will appear here once the endpoint is enabled." />
            )}
          </div>
        </div>

        {/* Uptime */}
        <div className="card">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">Uptime and memory</h2></div>
          <div className="card-body">
            {errors.uptime === 'admin' ? (
              <div className="text-sm text-warning">Uptime data requires admin access.</div>
            ) : errors.uptime ? (
              <div className="text-sm text-danger">{errors.uptime}</div>
            ) : uptime ? (
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Process uptime" value={formatUptime(uptime.uptimeSeconds ?? uptime.uptime)} />
                <StatCard
                  label="Heap used / total"
                  value={`${toMB(uptime.memory?.heapUsed ?? uptime.heapUsed ?? uptime.memoryUsage?.heapUsed)} / ${toMB(uptime.memory?.heapTotal ?? uptime.heapTotal ?? uptime.memoryUsage?.heapTotal)}`}
                />
              </div>
            ) : (
              <div className="text-sm text-muted">No uptime data available.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
