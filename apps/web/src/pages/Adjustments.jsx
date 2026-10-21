import { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Drawer from '../components/ui/Drawer.jsx';

function fmt(minor) {
  return (Number(minor || 0) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Adjustments() {
  const toast = useToast();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amountDollars: '', type: 'CREDIT', reason: '', invoiceId: '' });
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) loadAdjustments();
    else { setLoading(false); setError('Please select an organization first.'); }
  }, [organizationId, pagination.offset]);

  async function loadAdjustments() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const res = await api(`/adjustments?${params}`);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.adjustments || []);
        setAdjustments(list);
        setPagination(prev => ({ ...prev, total: res.data?.total ?? list.length }));
      } else {
        setError(res.error?.message || 'Failed to load adjustments');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.amountDollars || !form.type) { setFormError('Amount and type are required.'); return; }
    const amountMinor = Math.round(parseFloat(form.amountDollars) * 100);
    if (isNaN(amountMinor) || amountMinor <= 0) { setFormError('Enter a valid positive amount.'); return; }
    try {
      setFormError('');
      setSaving(true);
      const res = await api('/adjustments', {
        method: 'POST',
        body: JSON.stringify({ amountMinor, type: form.type, reason: form.reason || undefined, invoiceId: form.invoiceId || undefined }),
      });
      if (res.success) {
        setForm({ amountDollars: '', type: 'CREDIT', reason: '', invoiceId: '' });
        setShowCreate(false);
        toast.success('Adjustment created');
        loadAdjustments();
      } else {
        setFormError(res.error?.message || 'Failed to create adjustment');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'amountMinor', header: 'Amount', render: v => <span className="tabular-nums font-medium">{fmt(v)}</span> },
    { key: 'type', header: 'Type', render: v => <StatusBadge status={v} variant={v === 'CREDIT' ? 'badge-success' : 'badge-danger'} /> },
    { key: 'reason', header: 'Reason', render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'invoiceId', header: 'Invoice ID', mono: true, render: v => v ? v.slice(0, 16) + '…' : '—' },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Adjustments"
        description="Manage billing adjustments"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>New adjustment</button>}
      />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadAdjustments} className="btn-secondary">Retry</button>
          </div>
        )}
        {!error && (
          <DataTable
            columns={columns}
            data={adjustments}
            loading={loading}
            emptyState={
              <EmptyState
                icon={Sliders}
                title="No adjustments yet"
                description="Create adjustments to credit or debit invoices."
                action={<button className="btn-primary" onClick={() => setShowCreate(true)}>New adjustment</button>}
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

      <Drawer open={showCreate} onClose={() => { setShowCreate(false); setFormError(''); }} title="Create adjustment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($)</label>
              <input type="number" min="0.01" step="0.01" value={form.amountDollars} onChange={e => setForm({ ...form, amountDollars: e.target.value })} placeholder="10.00" className="input" autoFocus />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="select">
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for this adjustment" rows={3} className="textarea" />
          </div>
          <div>
            <label className="label">Invoice ID (optional)</label>
            <input type="text" value={form.invoiceId} onChange={e => setForm({ ...form, invoiceId: e.target.value })} placeholder="Link to invoice" className="input font-mono" />
          </div>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Creating…' : 'Create adjustment'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
