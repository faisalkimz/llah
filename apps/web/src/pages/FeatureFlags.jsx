import { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

export default function FeatureFlags() {
  const toast = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [newEnabled, setNewEnabled] = useState(false);
  const [addError, setAddError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [togglingKey, setTogglingKey] = useState(null);
  const [toggleConfirm, setToggleConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchFlags(); }, []);

  async function fetchFlags() {
    setLoading(true);
    setError(null);
    const response = await api('/feature-flags');
    if (response.success) setFlags(Array.isArray(response.data) ? response.data : []);
    else setError(response.error?.message || 'Failed to load feature flags');
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    const key = newKey.trim();
    if (!key) { setAddError('Flag key is required.'); return; }
    setAdding(true);
    setAddError(null);
    const response = await api(`/feature-flags/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ key, enabled: newEnabled }),
    });
    if (response.success) { setNewKey(''); setNewEnabled(false); await fetchFlags(); toast.success('Flag added'); }
    else setAddError(response.error?.message || 'Failed to add feature flag');
    setAdding(false);
  }

  async function handleToggle() {
    if (!toggleConfirm) return;
    setTogglingKey(toggleConfirm.key);
    const response = await api(`/feature-flags/${encodeURIComponent(toggleConfirm.key)}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled: !toggleConfirm.enabled }),
    });
    if (response.success) {
      setFlags(prev => prev.map(f => f.key === toggleConfirm.key ? { ...f, enabled: !f.enabled } : f));
      toast.success(`Flag ${toggleConfirm.enabled ? 'disabled' : 'enabled'}`);
    } else {
      toast.error(response.error?.message || 'Failed to update flag');
    }
    setTogglingKey(null);
    setToggleConfirm(null);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    const response = await api(`/feature-flags/${encodeURIComponent(deleteConfirm.key)}`, { method: 'DELETE' });
    if (response.success) { setFlags(prev => prev.filter(f => f.key !== deleteConfirm.key)); toast.success('Flag deleted'); }
    else toast.error(response.error?.message || 'Failed to delete flag');
    setDeleting(false);
    setDeleteConfirm(null);
  }

  const columns = [
    { key: 'key', header: 'Key', mono: true, render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'description', header: 'Description', render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'enabled', header: 'Status', render: v => <StatusBadge status={v ? 'ENABLED' : 'DISABLED'} /> },
    { key: 'updatedAt', header: 'Updated', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'actions', header: '',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); setToggleConfirm(row); }}
            disabled={togglingKey === row.key}
            className={`text-xs ${row.enabled ? 'text-warning hover:underline' : 'text-accent hover:underline'} disabled:opacity-50`}
          >
            {row.enabled ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); setDeleteConfirm(row); }}
            className="text-xs text-danger hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Feature flags" description="Platform feature flag management" />

      <div className="card bg-warning-muted border-warning/20 mb-6">
        <div className="card-body text-sm text-warning">
          Feature flags are platform-wide settings. Changes affect all organizations.
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="text-sm font-semibold text-ink">Add flag</h2></div>
        <div className="card-body">
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label">Key</label>
              <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="e.g. new_billing_flow" className="input w-64 font-mono" disabled={adding} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mb-0.5">
              <input type="checkbox" checked={newEnabled} onChange={e => setNewEnabled(e.target.checked)} disabled={adding} className="h-4 w-4 rounded border-line" />
              <span className="text-sm text-ink">Enabled</span>
            </label>
            <button type="submit" disabled={adding} className="btn-primary disabled:opacity-50">{adding ? 'Adding…' : 'Add flag'}</button>
          </form>
          {addError && <p className="mt-2 text-sm text-danger">{addError}</p>}
        </div>
      </div>

      {error && !loading && (
        <div className="card p-4 mb-4 text-sm text-danger">{error} <button onClick={fetchFlags} className="ml-3 underline">Retry</button></div>
      )}

      <div className="card">
        <DataTable
          columns={columns}
          data={flags}
          loading={loading}
          emptyState={<EmptyState icon={Flag} title="No feature flags" description="Add feature flags to control feature availability across the platform." />}
        />
      </div>

      <ConfirmModal
        open={!!toggleConfirm}
        onClose={() => setToggleConfirm(null)}
        onConfirm={handleToggle}
        title={`${toggleConfirm?.enabled ? 'Disable' : 'Enable'} flag`}
        description={`${toggleConfirm?.enabled ? 'Disable' : 'Enable'} "${toggleConfirm?.key}"? This affects all organizations.`}
        confirmLabel={toggleConfirm?.enabled ? 'Disable' : 'Enable'}
        confirmVariant={toggleConfirm?.enabled ? 'btn-danger' : 'btn-primary'}
      />

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete feature flag"
        description={`Delete "${deleteConfirm?.key}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="btn-danger"
      />
    </>
  );
}
