import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

function StatCard({ label, value, sub }) {
  return (
    <div className="llah-card p-5">
      <div className="text-sm text-muted mb-1">{label}</div>
      <div className="text-2xl font-bold text-ink">{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

export default function Developer() {
  const [overview, setOverview] = useState(null);
  const [apiStats, setApiStats] = useState([]);
  const [webhookStats, setWebhookStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setUnavailable(false);

      const [ovRes, asRes, wsRes] = await Promise.all([
        api('/developer/overview'),
        api('/developer/api-stats'),
        api('/developer/webhook-stats'),
      ]);

      // If all three are 404-style failures treat as "coming soon"
      const allFailed =
        !ovRes.success &&
        !asRes.success &&
        !wsRes.success &&
        [ovRes, asRes, wsRes].every(
          r => r.error?.code === 'NOT_FOUND' || r.error?.message?.toLowerCase().includes('not found')
        );

      if (allFailed) {
        setUnavailable(true);
        return;
      }

      if (ovRes.success) setOverview(ovRes.data);
      if (asRes.success) {
        const rows = Array.isArray(asRes.data)
          ? asRes.data
          : asRes.data?.stats || asRes.data?.days || [];
        setApiStats(rows.slice(0, 7));
      }
      if (wsRes.success) setWebhookStats(wsRes.data);
    } catch (e) {
      console.error('Developer stats error:', e);
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Developer" description="API access and integration statistics" />
        <div className="llah-card p-8 text-center text-muted">Loading developer stats…</div>
      </>
    );
  }

  if (unavailable) {
    return (
      <>
        <PageHeader title="Developer" description="API access and integration statistics" />
        <div className="llah-card p-12 text-center">
          <div className="text-4xl mb-4">🔧</div>
          <h2 className="text-lg font-semibold text-ink mb-2">Developer stats coming soon</h2>
          <p className="text-muted text-sm">
            API usage analytics and webhook delivery metrics will appear here once the
            developer stats endpoints are enabled.
          </p>
        </div>

        {/* Static links section still shown */}
        <div className="mt-8 llah-card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Resources</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-ink mb-1">API Documentation</h3>
              <a
                href="/api/docs"
                className="text-sm text-blue-600 hover:underline"
              >
                View API Reference →
              </a>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink mb-2">SDK Downloads</h3>
              <div className="flex flex-wrap gap-2">
                {['Node.js', 'Python', 'Go'].map(sdk => (
                  <span
                    key={sdk}
                    className="px-3 py-1 bg-neutral-100 text-ink text-sm rounded-full"
                  >
                    {sdk}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">SDKs are in development and will be available soon.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Developer" description="API access and integration statistics" />

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="API Key Count" value={overview?.apiKeyCount ?? overview?.api_key_count} />
        <StatCard label="Total Usage Events" value={overview?.totalUsageEvents ?? overview?.total_usage_events} />
        <StatCard
          label="Recent Events (30d)"
          value={overview?.recentEvents ?? overview?.recent_events}
          sub="Last 30 days"
        />
      </div>

      {/* API Stats */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-ink mb-4">API Requests — Last 7 Days</h2>
        <div className="llah-card">
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Request Count</th>
                  <th>Error Count</th>
                </tr>
              </thead>
              <tbody>
                {apiStats.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-muted">No API stats available</td>
                  </tr>
                ) : (
                  apiStats.map((row, i) => (
                    <tr key={i}>
                      <td className="text-sm">{row.date || row.day || '—'}</td>
                      <td className="text-sm">{row.requestCount ?? row.request_count ?? row.count ?? '—'}</td>
                      <td className="text-sm text-danger">{row.errorCount ?? row.error_count ?? row.errors ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Webhook Stats */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-ink mb-4">Webhook Delivery Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Deliveries"
            value={webhookStats?.total ?? webhookStats?.totalDeliveries}
          />
          <StatCard
            label="Succeeded"
            value={webhookStats?.succeeded ?? webhookStats?.success}
          />
          <StatCard
            label="Failed"
            value={webhookStats?.failed ?? webhookStats?.failure}
          />
          <StatCard
            label="Pending"
            value={webhookStats?.pending}
          />
        </div>
      </div>

      {/* Static links */}
      <div className="llah-card p-6">
        <h2 className="text-base font-semibold text-ink mb-4">Resources</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-ink mb-1">API Documentation</h3>
            <a href="/api/docs" className="text-sm text-blue-600 hover:underline">
              View API Reference →
            </a>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink mb-2">SDK Downloads</h3>
            <div className="flex flex-wrap gap-2">
              {['Node.js', 'Python', 'Go'].map(sdk => (
                <span
                  key={sdk}
                  className="px-3 py-1 bg-neutral-100 text-ink text-sm rounded-full"
                >
                  {sdk}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">SDKs are in development and will be available soon.</p>
          </div>
        </div>
      </div>
    </>
  );
}
