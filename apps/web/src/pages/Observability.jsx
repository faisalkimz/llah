import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

function formatUptime(seconds) {
  if (seconds == null || isNaN(seconds)) return '—';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  return parts.join(', ');
}

function toMB(bytes) {
  if (bytes == null) return '—';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function StatusDot({ ok }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
        ok ? 'bg-green-500' : 'bg-red-500'
      }`}
      aria-hidden="true"
    />
  );
}

export default function Observability() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [uptimeError, setUptimeError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setHealthError(null);
    setMetricsError(null);
    setUptimeError(null);

    const [healthRes, metricsRes, uptimeRes] = await Promise.all([
      api('/observability/health'),
      api('/observability/metrics'),
      api('/observability/uptime'),
    ]);

    if (healthRes.success) {
      setHealth(healthRes.data);
    } else {
      setHealthError(healthRes.error?.message || 'Failed to load health data');
    }

    if (metricsRes.success) {
      setMetrics(metricsRes.data);
    } else {
      const code = metricsRes.error?.code;
      if (
        code === 'FORBIDDEN' ||
        code === 'UNAUTHORIZED' ||
        metricsRes.error?.message?.toLowerCase().includes('forbidden') ||
        metricsRes.error?.message?.toLowerCase().includes('admin')
      ) {
        setMetricsError('admin');
      } else {
        setMetricsError(metricsRes.error?.message || 'Failed to load metrics');
      }
    }

    if (uptimeRes.success) {
      setUptime(uptimeRes.data);
    } else {
      const code = uptimeRes.error?.code;
      if (
        code === 'FORBIDDEN' ||
        code === 'UNAUTHORIZED' ||
        uptimeRes.error?.message?.toLowerCase().includes('forbidden') ||
        uptimeRes.error?.message?.toLowerCase().includes('admin')
      ) {
        setUptimeError('admin');
      } else {
        setUptimeError(uptimeRes.error?.message || 'Failed to load uptime');
      }
    }

    setLoading(false);
  };

  const dbOk =
    health?.database === 'ok' ||
    health?.database?.status === 'ok' ||
    health?.db === 'ok' ||
    health?.status === 'ok';

  return (
    <>
      <PageHeader
        title="System Health"
        description="Platform observability and uptime"
      />

      {loading && (
        <div className="llah-card p-8 text-center text-muted">
          Loading observability data...
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Health Card */}
          <div className="llah-card p-6">
            <h2 className="text-base font-semibold mb-4">Health Check</h2>
            {healthError ? (
              <div className="text-destructive text-sm">
                Error: {healthError}
                <button
                  onClick={fetchAll}
                  className="ml-3 btn-secondary text-xs"
                >
                  Retry
                </button>
              </div>
            ) : health ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center text-sm">
                  <StatusDot ok={dbOk} />
                  <span className="font-medium mr-2">Database:</span>
                  <span className={dbOk ? 'text-green-700' : 'text-red-600'}>
                    {dbOk ? 'Connected' : 'Unavailable'}
                  </span>
                </div>
                {health.checkedAt || health.timestamp ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    Last checked:{' '}
                    {new Date(
                      health.checkedAt || health.timestamp
                    ).toLocaleString()}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-muted text-sm">No health data available.</div>
            )}
          </div>

          {/* Metrics Section */}
          <div className="llah-card p-6">
            <h2 className="text-base font-semibold mb-4">Metrics</h2>
            {metricsError === 'admin' ? (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-4 py-3">
                Metrics require admin access.
              </div>
            ) : metricsError ? (
              <div className="text-destructive text-sm">
                Error: {metricsError}
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.apiKeys != null && (
                  <div className="bg-muted/20 rounded p-4">
                    <div className="text-xs text-muted-foreground mb-1">API Keys</div>
                    <div className="text-2xl font-semibold">{metrics.apiKeys}</div>
                  </div>
                )}
                {metrics.webhookDeliveries != null && (
                  <>
                    <div className="bg-green-50 rounded p-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Webhooks Succeeded
                      </div>
                      <div className="text-2xl font-semibold text-green-700">
                        {metrics.webhookDeliveries.succeeded ??
                          metrics.webhookDeliveries.success ??
                          '—'}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded p-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Webhooks Failed
                      </div>
                      <div className="text-2xl font-semibold text-red-700">
                        {metrics.webhookDeliveries.failed ?? '—'}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded p-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Webhooks Pending
                      </div>
                      <div className="text-2xl font-semibold text-yellow-700">
                        {metrics.webhookDeliveries.pending ?? '—'}
                      </div>
                    </div>
                  </>
                )}
                {metrics.recentAuditEvents != null && (
                  <div className="bg-muted/20 rounded p-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      Recent Audit Events
                    </div>
                    <div className="text-2xl font-semibold">
                      {metrics.recentAuditEvents}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted text-sm">No metrics available.</div>
            )}
          </div>

          {/* Uptime Section */}
          <div className="llah-card p-6">
            <h2 className="text-base font-semibold mb-4">Uptime &amp; Memory</h2>
            {uptimeError === 'admin' ? (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-4 py-3">
                Metrics require admin access.
              </div>
            ) : uptimeError ? (
              <div className="text-destructive text-sm">
                Error: {uptimeError}
              </div>
            ) : uptime ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/20 rounded p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Process Uptime
                  </div>
                  <div className="text-sm font-medium">
                    {formatUptime(uptime.uptimeSeconds ?? uptime.uptime)}
                  </div>
                </div>
                <div className="bg-muted/20 rounded p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Heap Used / Total
                  </div>
                  <div className="text-sm font-medium">
                    {toMB(
                      uptime.memory?.heapUsed ??
                        uptime.heapUsed ??
                        uptime.memoryUsage?.heapUsed
                    )}{' '}
                    /{' '}
                    {toMB(
                      uptime.memory?.heapTotal ??
                        uptime.heapTotal ??
                        uptime.memoryUsage?.heapTotal
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted text-sm">No uptime data available.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
