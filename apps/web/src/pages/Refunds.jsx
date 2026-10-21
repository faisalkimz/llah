import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Drawer from '../components/ui/Drawer.jsx';

function fmt(minor) {
  const n = Number(minor || 0);
  return (n / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Refunds() {
  const toast = useToast();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [processConfirm, setProcessConfirm] = useState(null);
  const [form, setForm] = useState({ paymentId: '', amountDollars: '', reason: '' });
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) loadRefunds();
    else { setLoading(false); setError('Please select an organization first.'); }
  }, [organizationId, pagination.offset]);

  async function loadRefunds() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const res = await api(`/refunds?${params}`);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.refunds || []);
        setRefunds(list);
        setPagination(prev => ({ ...prev, total: res.data?.total ?? list.length }));
      } else {
        setError(res.error?.message || 'Failed to load refunds');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.paymentId || !form.amountDollars) { setFormError('Payment ID and amount are required.'); return; }
    const amountMinor = Math.round(parseFloat(form.amountDollars) * 100);
    if (isNaN(amountMinor) || amountMinor <= 0) { setFormError('Enter a valid positive amount.'); return; }
    try {
      setFormError('');
      setSaving(true);
      const res = await api('/refunds', {
        method: 'POST',
        body: JSON.stringify({ paymentId: form.paymentId, amountMinor, reason: form.reason || undefined }),
      });
      if (res.success) {
        setForm({ paymentId: '', amountDollars: '', reason: '' });
        setShowCreate(false);
        toast.success('Refund created');
        loadRefunds();
      } else {
        setFormError(res.error?.message || 'Failed to create refund');
      }
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleProcess() {
    if (!processConfirm) return;
    try {
      setProcessing(processConfirm);
      const res = await api(`/refunds/${processConfirm}/process`, { method: 'POST' });
      if (res.success) {
        toast.success('Refund processed');
        loadRefunds();
      } else {
        toast.error(res.error?.message || 'Failed to process refund');
      }
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setProcessing(null);
      setProcessConfirm(null);
    }
  }

  const columns = [
    { key: 'amountMinor', header: 'Amount', render: v => <span className="tabular-nums font-medium">{fmt(v)}</span> },
    { key: 'reason', header: 'Reason', render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'paymentId', header: 'Payment ID', mono: true, render: v => v ? v.slice(0, 16) + '…' : '—' },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
    {
      key: 'actions',
      header: '',
      render: (_, row) => row.status === 'PENDING' ? (
        <button
          onClick={e => { e.stopPropagation(); setProcessConfirm(row.id); }}
          disabled={processing === row.id}
          className="text-xs btn-secondary disabled:opacity-50"
        >
          {processing === row.id ? 'Processing…' : 'Process'}
        </button>
      ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Refunds"
        description="Manage payment refunds"
        action={<button className="btn-primary" onClick={() => setShowCreate(v => !v)}>New refund</button>}
      />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadRefunds} className="btn-secondary">Retry</button>
          </div>
        )}
        {!error && (
          <DataTable
            columns={columns}
            data={refunds}
            loading={loading}
            emptyState={
              <EmptyState
                icon={RefreshCw}
                title="No refunds yet"
                description="Process refunds for payments here."
                action={<button className="btn-primary" onClick={() => setShowCreate(true)}>New refund</button>}
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

      <Drawer open={showCreate} onClose={() => { setShowCreate(false); setFormError(''); }} title="Create refund">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Payment ID</label>
            <input type="text" value={form.paymentId} onChange={e => setForm({ ...form, paymentId: e.target.value })} placeholder="Payment ID to refund" className="input font-mono" />
          </div>
          <div>
            <label className="label">Amount ($)</label>
            <input type="number" min="0.01" step="0.01" value={form.amountDollars} onChange={e => setForm({ ...form, amountDollars: e.target.value })} placeholder="e.g. 25.00" className="input" />
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for this refund" rows={3} className="textarea" />
          </div>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Creating…' : 'Create refund'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!processConfirm}
        onClose={() => setProcessConfirm(null)}
        onConfirm={handleProcess}
        title="Process refund"
        description="Process this refund now? This action cannot be undone."
        confirmLabel="Process refund"
        confirmVariant="btn-primary"
      />
    </>
  );
}
