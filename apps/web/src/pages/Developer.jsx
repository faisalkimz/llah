import { useState, useEffect } from 'react';
import { Wrench, Link as LinkIcon } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CodeBlock from '../components/ui/CodeBlock.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

const CURL_EXAMPLE = `curl -X GET https://api.llah.io/v1/customers \\
  -H "Authorization: Bearer llah_live_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json"`;

const NODE_EXAMPLE = `const response = await fetch('https://api.llah.io/v1/customers', {
  headers: {
    Authorization: 'Bearer llah_live_YOUR_KEY_HERE',
    'Content-Type': 'application/json',
  },
});
const data = await response.json();`;

const PYTHON_EXAMPLE = `import requests

response = requests.get(
    'https://api.llah.io/v1/customers',
    headers={
        'Authorization': 'Bearer llah_live_YOUR_KEY_HERE',
        'Content-Type': 'application/json',
    }
)
data = response.json()`;

export default function Developer() {
  const [overview, setOverview] = useState(null);
  const [apiStats, setApiStats] = useState([]);
  const [webhookStats, setWebhookStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [codeTab, setCodeTab] = useState('cURL');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setUnavailable(false);
      const [ovRes, asRes, wsRes] = await Promise.all([
        api('/developer/overview'),
        api('/developer/api-stats'),
        api('/developer/webhook-stats'),
      ]);
      const allFailed = !ovRes.success && !asRes.success && !wsRes.success;
      if (allFailed) { setUnavailable(true); return; }
      if (ovRes.success) setOverview(ovRes.data);
      if (asRes.success) {
        const rows = Array.isArray(asRes.data) ? asRes.data : (asRes.data?.stats || asRes.data?.days || []);
        setApiStats(rows.slice(0, 7));
      }
      if (wsRes.success) setWebhookStats(wsRes.data);
    } catch (e) {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }

  const CODE = { cURL: CURL_EXAMPLE, Node: NODE_EXAMPLE, Python: PYTHON_EXAMPLE };

  const apiStatsColumns = [
    { key: 'date', header: 'Date', render: (v, row) => v || row.day || '—', cellClassName: 'cell-muted' },
    { key: 'requestCount', header: 'Requests', render: (v, row) => <span className="tabular-nums">{v ?? row.request_count ?? row.count ?? '—'}</span> },
    { key: 'errorCount', header: 'Errors', render: (v, row) => <span className="tabular-nums text-danger">{v ?? row.error_count ?? row.errors ?? '—'}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Developer tools"
        description="API access and integration statistics"
      />

      {loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[0,1,2].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && !unavailable && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="API key count" value={overview?.apiKeyCount ?? overview?.api_key_count ?? '—'} />
            <StatCard label="Total usage events" value={overview?.totalUsageEvents ?? overview?.total_usage_events ?? '—'} />
            <StatCard label="Recent events (30d)" value={overview?.recentEvents ?? overview?.recent_events ?? '—'} sub="Last 30 days" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total deliveries" value={webhookStats?.total ?? webhookStats?.totalDeliveries ?? '—'} />
            <StatCard label="Succeeded" value={webhookStats?.succeeded ?? webhookStats?.success ?? '—'} />
            <StatCard label="Failed" value={webhookStats?.failed ?? webhookStats?.failure ?? '—'} />
            <StatCard label="Pending" value={webhookStats?.pending ?? '—'} />
          </div>

          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-ink">API requests — last 7 days</h2>
            </div>
            <DataTable
              columns={apiStatsColumns}
              data={apiStats}
              emptyState={<EmptyState icon={Wrench} title="No API stats" description="Stats will appear once API requests are made." />}
            />
          </div>
        </>
      )}

      {!loading && unavailable && (
        <div className="card p-10 text-center mb-6">
          <Wrench className="h-10 w-10 text-muted mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-ink mb-2">Developer stats coming soon</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            API usage analytics and webhook delivery metrics will appear here once developer stat endpoints are enabled.
          </p>
        </div>
      )}

      {/* Code samples */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-ink">Quickstart</h2>
        </div>
        <div className="p-4">
          <div className="tab-list mb-3">
            {['cURL', 'Node', 'Python'].map(tab => (
              <button key={tab} onClick={() => setCodeTab(tab)} className={`tab ${codeTab === tab ? 'tab-active' : ''}`}>{tab}</button>
            ))}
          </div>
          <CodeBlock code={CODE[codeTab]} language={codeTab === 'cURL' ? 'bash' : codeTab === 'Node' ? 'javascript' : 'python'} />
        </div>
      </div>

      {/* Resources */}
      <div className="card">
        <div className="card-header"><h2 className="text-sm font-semibold text-ink">Resources</h2></div>
        <div className="card-body space-y-4">
          <div>
            <p className="text-sm font-medium text-ink mb-1">API documentation</p>
            <a href="/api/docs" className="text-sm text-accent hover:underline flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" />
              View API reference
            </a>
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-2">SDKs</p>
            <div className="flex gap-2 flex-wrap">
              {['Node.js', 'Python', 'Go'].map(sdk => (
                <span key={sdk} className="badge badge-neutral">{sdk}</span>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">SDKs are in development and will be available soon.</p>
          </div>
        </div>
      </div>
    </>
  );
}
