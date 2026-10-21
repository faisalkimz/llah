import { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Drawer from '../components/ui/Drawer.jsx';

const ALL_EVENTS = [
  'invoice.created','invoice.paid','invoice.voided',
  'payment.succeeded','payment.failed',
  'subscription.created','subscription.canceled',
  'credit.applied','refund.issued','alert.fired',
];

const TABS = ['Endpoints', 'Deliveries'];

export default function Webhooks() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Endpoints');
  const [endpoints, setEndpoints] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState([]);
  const [formSecret, setFormSecret] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [retrying, setRetrying] = useState(null);
  const [dlPagination, setDlPagination] = useState({ limit: 20, offset: 0, total: 0 });

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadDeliveries(); }, [dlPagination.offset]);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const [epRes] = await Promise.all([
        api('/webhooks-outbound/endpoints'),
      ]);
      if (epRes.success) {
        setEndpoints(Array.isArray(epRes.data) ? epRes.data : (epRes.data?.endpoints || []));
      }
      await loadDeliveries();
    } catch (e) {
      setError(e.message || 'Failed to load webhook data');
    } finally {
      setLoading(false);
    }
  }

  async function loadDeliveries() {
    const params = new URLSearchParams({ limit: dlPagination.limit.toString(), offset: dlPagination.offset.toString() });
    const dlRes = await api(`/webhooks-outbound/deliveries?${params}`);
    if (dlRes.success) {
      const list = Array.isArray(dlRes.data) ? dlRes.data : (dlRes.data?.deliveries || []);
      setDeliveries(list);
      setDlPagination(prev => ({ ...prev, total: dlRes.data?.total ?? list.length }));
    }
  }

  function toggleEvent(evt) {
    setFormEvents(prev => prev.includes(evt) ? prev.filter(e => e !== evt) : [...prev, evt]);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formUrl.trim()) { setFormError('URL is required'); return; }
    if (formEvents.length === 0) { setFormError('Select at least one event'); return; }
    try {
      setSaving(true);
      setFormError('');
      const body = { url: formUrl.trim(), events: formEvents };
      if (formSecret.trim()) body.secret = formSecret.trim();
      const res = await api('/webhooks-outbound/endpoints', { method: 'POST', body: JSON.stringify(body) });
      if (res.success) {
        setFormUrl(''); setFormEvents([]); setFormSecret('');
        setShowCreate(false);
        toast.success('Endpoint created');
        loadAll();
      } else {
        setFormError(res.error?.message || 'Failed to create endpoint');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      const res = await api(`/webhooks-outbound/endpoints/${deleteConfirm}`, { method: 'DELETE' });
      if (res.success) { toast.success('Endpoint deleted'); loadAll(); }
      else { toast.error(res.error?.message || 'Failed to delete endpoint'); }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  async function handleRetry(id) {
    try {
      setRetrying(id);
      const res = await api(`/webhooks-outbound/deliveries/${id}/retry`, { method: 'POST' });
      if (res.success) { toast.success('Delivery retried'); loadDeliveries(); }
      else { toast.error(res.error?.message || 'Failed to retry delivery'); }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRetrying(null);
    }
  }

  const epColumns = [
    { key: 'url', header: 'URL', render: v => <span className="font-mono text-xs break-all">{v}</span> },
    { key: 'events', header: 'Events', render: v => Array.isArray(v) ? `${v.length} event${v.length !== 1 ? 's' : ''}` : '—', cellClassName: 'cell-muted' },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v !== false ? 'ACTIVE' : 'DISABLED'} /> },
    { key: 'createdAt', header: 'Created', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'actions', header: '',
      render: (_, row) => (
        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(row.id); }} className="text-xs text-danger hover:underline">Delete</button>
      ),
    },
  ];

  const dlColumns = [
    { key: 'endpointUrl', header: 'Endpoint', render: (v, row) => <span className="font-mono text-xs break-all">{v || row.endpoint?.url || '—'}</span> },
    { key: 'eventType', header: 'Event', render: (v, row) => v || row.event || '—' },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v || 'PENDING'} /> },
    { key: 'createdAt', header: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'actions', header: '',
      render: (_, row) => (row.status === 'FAILED') ? (
        <button
          onClick={e => { e.stopPropagation(); handleRetry(row.id); }}
          disabled={retrying === row.id}
          className="text-xs btn-secondary disabled:opacity-50"
        >
          {retrying === row.id ? 'Retrying…' : 'Retry'}
        </button>
      ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Manage outbound webhook endpoints and delivery logs"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Add endpoint</button>}
      />

      {error && (
        <div className="card p-4 mb-4 border-danger/30 bg-danger-muted text-sm text-danger">
          {error} <button onClick={loadAll} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="tab-list mb-4">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab ${activeTab === tab ? 'tab-active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Endpoints' && (
        <div className="card">
          <DataTable
            columns={epColumns}
            data={endpoints}
            loading={loading}
            emptyState={
              <EmptyState
                icon={GitBranch}
                title="No endpoints yet"
                description="Add a webhook endpoint to receive event notifications."
                action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Add endpoint</button>}
              />
            }
          />
        </div>
      )}

      {activeTab === 'Deliveries' && (
        <div className="card">
          <DataTable
            columns={dlColumns}
            data={deliveries}
            loading={loading}
            emptyState={
              <EmptyState icon={GitBranch} title="No deliveries yet" description="Webhook delivery attempts will appear here." />
            }
          />
          {!loading && dlPagination.total > dlPagination.limit && (
            <TablePagination
              offset={dlPagination.offset}
              limit={dlPagination.limit}
              total={dlPagination.total}
              onPageChange={offset => setDlPagination(prev => ({ ...prev, offset }))}
            />
          )}
        </div>
      )}

      <Drawer open={showCreate} onClose={() => { setShowCreate(false); setFormError(''); }} title="New webhook endpoint">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">URL</label>
            <input type="url" value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="https://example.com/webhook" className="input" autoFocus required />
          </div>
          <div>
            <label className="label">Events to listen for</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ALL_EVENTS.map(evt => (
                <label key={evt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formEvents.includes(evt)} onChange={() => toggleEvent(evt)} className="h-4 w-4 rounded border-line" />
                  <span className="text-ink font-mono text-xs">{evt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Signing secret <span className="text-muted font-normal">(optional)</span></label>
            <input type="text" value={formSecret} onChange={e => setFormSecret(e.target.value)} placeholder="Signing secret for payload verification" className="input" />
          </div>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Creating…' : 'Create endpoint'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete endpoint"
        description="Delete this webhook endpoint? This cannot be undone."
        confirmLabel="Delete endpoint"
        confirmVariant="btn-danger"
      />
    </>
  );
}
