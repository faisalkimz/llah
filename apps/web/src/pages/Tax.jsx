import { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Drawer from '../components/ui/Drawer.jsx';

const EMPTY_FORM = { name: '', rate: '', country: '', region: '', active: true };

export default function Tax() {
  const toast = useToast();
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) loadTaxRates();
    else { setLoading(false); setError('Please select an organization first.'); }
  }, [organizationId, pagination.offset]);

  async function loadTaxRates() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const res = await api(`/tax?${params}`);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.taxRates || []);
        setTaxRates(list);
        setPagination(prev => ({ ...prev, total: res.data?.total ?? list.length }));
      } else {
        setError(res.error?.message || 'Failed to load tax rates');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(taxRate) {
    setEditingId(taxRate.id);
    setForm({
      name: taxRate.name || '',
      rate: taxRate.rate != null ? String(taxRate.rate) : '',
      country: taxRate.country || '',
      region: taxRate.region || '',
      active: taxRate.active !== false,
    });
    setFormError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.rate || !form.country) { setFormError('Name, rate and country are required.'); return; }
    const rate = parseFloat(form.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) { setFormError('Rate must be 0–100.'); return; }
    try {
      setFormError('');
      setSaving(true);
      const payload = { name: form.name, rate, country: form.country, region: form.region || undefined, active: form.active };
      const res = editingId
        ? await api(`/tax/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api('/tax', { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) {
        toast.success(editingId ? 'Tax rate updated' : 'Tax rate created');
        setShowForm(false);
        loadTaxRates();
      } else {
        setFormError(res.error?.message || 'Failed to save tax rate');
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
      const res = await api(`/tax/${deleteConfirm.id}`, { method: 'DELETE' });
      if (res.success) {
        toast.success(`Tax rate "${deleteConfirm.name}" deleted`);
        loadTaxRates();
      } else {
        toast.error(res.error?.message || 'Failed to delete tax rate');
      }
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'rate', header: 'Rate', render: v => <span className="tabular-nums">{v}%</span> },
    { key: 'country', header: 'Country', cellClassName: 'cell-muted' },
    { key: 'region', header: 'Region', render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v ? 'ACTIVE' : 'DISABLED'} /> },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <div className="flex gap-3">
          <button onClick={e => { e.stopPropagation(); openEdit(row); }} className="text-xs text-accent hover:underline">Edit</button>
          <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ id: row.id, name: row.name }); }} className="text-xs text-danger hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Tax rates"
        description="Manage tax rates for billing"
        action={<button className="btn-primary" onClick={openCreate}>New tax rate</button>}
      />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadTaxRates} className="btn-secondary">Retry</button>
          </div>
        )}
        {!error && (
          <DataTable
            columns={columns}
            data={taxRates}
            loading={loading}
            emptyState={
              <EmptyState
                icon={Receipt}
                title="No tax rates yet"
                description="Configure tax rates to apply to invoices."
                action={<button className="btn-primary" onClick={openCreate}>New tax rate</button>}
              />
            }
          />
        )}
        {!loading && !error && pagination.total > pagination.limit && (
          <TablePagination
            offset={pagination.offset}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={offset => setPagination(prev => ({ ...prev, offset }))}
          />
        )}
      </div>

      <Drawer
        open={showForm}
        onClose={() => { setShowForm(false); setFormError(''); }}
        title={editingId ? 'Edit tax rate' : 'Create tax rate'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. VAT" className="input" autoFocus />
            </div>
            <div>
              <label className="label">Rate (%)</label>
              <input type="number" min="0" max="100" step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="20" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Country</label>
              <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="US" className="input" />
            </div>
            <div>
              <label className="label">Region (optional)</label>
              <input type="text" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="CA" className="input" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-line" />
            <span className="text-sm text-ink">Active</span>
          </label>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create tax rate'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete tax rate"
        description={`Delete "${deleteConfirm?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="btn-danger"
      />
    </>
  );
}
