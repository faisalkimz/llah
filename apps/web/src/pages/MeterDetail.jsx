import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Pencil, Trash2, X, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonText } from '../components/ui/Skeleton.jsx';

const AGGREGATION_TYPES = [
  { value: 'SUM',    label: 'Sum' },
  { value: 'COUNT',  label: 'Count' },
  { value: 'MAX',    label: 'Maximum' },
  { value: 'LATEST', label: 'Latest' },
];

export default function MeterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [meter, setMeter]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [editing, setEditing]       = useState(false);
  const [formData, setFormData]     = useState({});
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId && id) loadMeter();
  }, [organizationId, id]);

  async function loadMeter() {
    try {
      setLoading(true);
      setError(null);
      const result = await api(`/meters/${id}`);
      if (result.success) {
        setMeter(result.data);
        setFormData({
          name:        result.data.name        || '',
          unit:        result.data.unit        || '',
          aggregation: result.data.aggregation || 'SUM',
        });
      } else {
        setError(result.error?.message || 'Failed to load meter.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load meter.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {};
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== meter[k]) payload[k] = v;
      });
      if (Object.keys(payload).length === 0) { setEditing(false); return; }
      const result = await api(`/meters/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      if (result.success) {
        setMeter(result.data);
        setEditing(false);
        toast?.success?.('Meter updated.');
      } else {
        setSaveError(result.error?.message || 'Failed to update meter.');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update meter.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditing(false);
    setSaveError(null);
    setFormData({ name: meter.name || '', unit: meter.unit || '', aggregation: meter.aggregation || 'SUM' });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await api(`/meters/${id}`, { method: 'DELETE' });
      if (result.success) {
        navigate('/meters');
      } else {
        toast?.error?.(result.error?.message || 'Failed to delete meter.');
      }
    } catch (err) {
      toast?.error?.(err.message || 'Failed to delete meter.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  // ── No org ────────────────────────────────────────────────────
  if (!organizationId) {
    return (
      <EmptyState
        title="No organization selected"
        description="Select an organization to view this meter."
        action={{ label: 'Go to organizations', onClick: () => navigate('/organizations') }}
      />
    );
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48"><SkeletonText /></div>
        <div className="card p-6 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-5 w-full max-w-sm"><SkeletonText /></div>)}
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error || !meter) {
    return (
      <EmptyState
        title="Meter not found"
        description={error || 'This meter does not exist or you do not have access.'}
        action={{ label: 'Back to meters', onClick: () => navigate('/meters') }}
      />
    );
  }

  const aggLabel = AGGREGATION_TYPES.find(t => t.value === meter.aggregation)?.label ?? meter.aggregation;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted mb-5" aria-label="Breadcrumb">
        <Link to="/meters" className="hover:text-ink transition-colors">Meters</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink font-medium">{meter.name}</span>
      </nav>

      <PageHeader
        title={meter.name}
        description={<span className="font-mono text-xs">{meter.key}</span>}
      >
        {!editing ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)} className="btn-secondary btn-sm gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button onClick={() => setDeleteConfirm(true)} disabled={deleting} className="btn-danger btn-sm gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button form="meter-form" type="submit" disabled={saving} className="btn-primary btn-sm gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-secondary btn-sm gap-1.5">
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}
      </PageHeader>

      {/* Stat cards */}
      {meter._count && (
        <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-semibold text-ink tabular-nums">{meter._count.usageEvents ?? 0}</div>
            <div className="text-xs text-muted mt-1">Usage events</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-semibold text-ink tabular-nums">{meter._count.prices ?? 0}</div>
            <div className="text-xs text-muted mt-1">Prices attached</div>
          </div>
        </div>
      )}

      {/* Details form */}
      <form id="meter-form" onSubmit={handleSave} className="space-y-6">
        {saveError && (
          <div className="rounded-lg bg-danger-muted border border-danger/20 px-4 py-3 text-sm text-danger">
            {saveError}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-ink">Meter details</h2>
          </div>
          <div className="card-body space-y-5">

            {/* Meter key — always read-only */}
            <div>
              <label className="label">Meter key</label>
              <div className="code-block py-2">{meter.key}</div>
              <p className="label-caption">Key is immutable after creation to preserve data integrity.</p>
            </div>

            {/* Display name */}
            <div>
              <label className="label" htmlFor="meter-name">Display name</label>
              {editing ? (
                <input id="meter-name" name="name" type="text" value={formData.name} onChange={handleChange} className="input" required />
              ) : (
                <div className="text-sm text-ink">{meter.name}</div>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="label" htmlFor="meter-unit">Unit</label>
              {editing ? (
                <input id="meter-unit" name="unit" type="text" value={formData.unit} onChange={handleChange} className="input" required placeholder="e.g. requests, GB, minutes" />
              ) : (
                <div className="text-sm text-ink">{meter.unit || <span className="text-muted">Not set</span>}</div>
              )}
            </div>

            {/* Aggregation */}
            <div>
              <label className="label" htmlFor="meter-agg">Aggregation method</label>
              {editing ? (
                <select id="meter-agg" name="aggregation" value={formData.aggregation} onChange={handleChange} className="select" required>
                  {AGGREGATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              ) : (
                <div className="text-sm text-ink">{aggLabel}</div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-ink">Metadata</h2>
          </div>
          <div className="card-body">
            <dl className="kv-list">
              <div className="kv-row">
                <dt className="kv-key">Meter ID</dt>
                <dd className="kv-value font-mono text-xs">{meter.id}</dd>
              </div>
              <div className="kv-row">
                <dt className="kv-key">Created</dt>
                <dd className="kv-value">{new Date(meter.createdAt).toLocaleString()}</dd>
              </div>
              {meter.updatedAt && (
                <div className="kv-row">
                  <dt className="kv-key">Last updated</dt>
                  <dd className="kv-value">{new Date(meter.updatedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </form>

      <ConfirmModal
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete meter"
        description={`Delete meter "${meter.name}"? This cannot be undone. It will fail if the meter has existing usage events or prices.`}
        confirmLabel="Delete meter"
        confirmVariant="btn-danger"
      />
    </>
  );
}
