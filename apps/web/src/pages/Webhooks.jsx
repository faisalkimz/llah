import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const ALL_EVENTS = [
  'invoice.created',
  'invoice.paid',
  'invoice.voided',
  'payment.succeeded',
  'payment.failed',
  'subscription.created',
  'subscription.canceled',
  'credit.applied',
  'refund.issued',
  'alert.fired',
];

function StatusBadge({ status }) {
  const map = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUCCEEDED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function Webhooks() {
  const [endpoints, setEndpoints] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState([]);
  const [formSecret, setFormSecret] = useState('');
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const [epRes, dlRes] = await Promise.all([
        api('/webhooks-outbound/endpoints'),
        api('/webhooks-outbound/deliveries?limit=20'),
      ]);
      if (epRes.success) {
        setEndpoints(Array.isArray(epRes.data) ? epRes.data : (epRes.data?.endpoints || []));
      }
      if (dlRes.success) {
        setDeliveries(Array.isArray(dlRes.data) ? dlRes.data : (dlRes.data?.deliveries || []));
      }
      if (!epRes.success && !dlRes.success) {
        setError(epRes.error?.message || 'Failed to load webhook data');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function toggleEvent(evt) {
    setFormEvents(prev =>
      prev.includes(evt) ? prev.filter(e => e !== evt) : [...prev, evt]
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formUrl.trim()) {
      setFormError('URL is required');
      return;
    }
    if (formEvents.length === 0) {
      setFormError('Select at least one event');
      return;
    }
    try {
      setFormSaving(true);
      setFormError('');
      const body = { url: formUrl.trim(), events: formEvents };
      if (formSecret.trim()) body.secret = formSecret.trim();
      const res = await api('/webhooks-outbound/endpoints', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.success) {
        setFormUrl('');
        setFormEvents([]);
        setFormSecret('');
        setShowCreate(false);
        loadAll();
      } else {
        setFormError(res.error?.message || 'Failed to create endpoint');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this webhook endpoint? This cannot be undone.')) return;
    try {
      const res = await api(`/webhooks-outbound/endpoints/${id}`, { method: 'DELETE' });
      if (res.success) {
        loadAll();
      }
    } catch (e) {
      console.error('Failed to delete endpoint:', e);
    }
  }

  return (
    <>
      <PageHeader title="Webhooks" description="Manage outbound webhook endpoints and monitor deliveries" />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
          <button onClick={loadAll} className="ml-3 underline text-red-700 hover:text-red-800">Retry</button>
        </div>
      )}

      {/* ── Endpoints ─────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Endpoints</h2>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="px-4 py-2 bg-ink text-white text-sm rounded-lg hover:bg-ink/90 transition-colors"
          >
            {showCreate ? 'Cancel' : '+ Add Endpoint'}
          </button>
        </div>

        {showCreate && (
          <div className="llah-card p-6 mb-4">
            <h3 className="font-semibold text-ink mb-4">New Webhook Endpoint</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">URL</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_EVENTS.map(evt => (
                    <label key={evt} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formEvents.includes(evt)}
                        onChange={() => toggleEvent(evt)}
                        className="rounded border-line"
                      />
                      <span className="text-ink">{evt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Secret <span className="text-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formSecret}
                  onChange={e => setFormSecret(e.target.value)}
                  placeholder="Signing secret for payload verification"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>

              {formError && (
                <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {formSaving ? 'Saving…' : 'Create Endpoint'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setFormError(''); }}
                  className="px-4 py-2 border border-line rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="llah-card">
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Events</th>
                  <th>Active</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted">Loading endpoints…</td>
                  </tr>
                ) : endpoints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted">
                      No endpoints yet.{' '}
                      <button onClick={() => setShowCreate(true)} className="text-ink underline">Add one</button>
                    </td>
                  </tr>
                ) : (
                  endpoints.map(ep => (
                    <tr key={ep.id}>
                      <td className="font-mono text-sm break-all max-w-xs">{ep.url}</td>
                      <td className="text-sm text-muted">
                        {Array.isArray(ep.events) ? `${ep.events.length} event${ep.events.length !== 1 ? 's' : ''}` : '—'}
                      </td>
                      <td>
                        {ep.active !== false ? (
                          <span className="text-green-700">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="text-muted text-sm">
                        {ep.createdAt ? new Date(ep.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(ep.id)}
                          className="text-sm text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Recent Deliveries ──────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-ink mb-4">Recent Deliveries</h2>
        <div className="llah-card">
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>Endpoint URL</th>
                  <th>Event Type</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-muted">Loading deliveries…</td>
                  </tr>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-muted">No deliveries yet</td>
                  </tr>
                ) : (
                  deliveries.map(d => (
                    <tr key={d.id}>
                      <td className="font-mono text-xs break-all max-w-xs">{d.endpointUrl || d.endpoint?.url || '—'}</td>
                      <td className="text-sm">{d.eventType || d.event || '—'}</td>
                      <td><StatusBadge status={d.status || 'PENDING'} /></td>
                      <td className="text-muted text-sm">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
