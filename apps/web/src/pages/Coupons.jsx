import { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Drawer from '../components/ui/Drawer.jsx';

export default function Coupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });
  const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxRedemptions: '', expiresAt: '' });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) loadCoupons();
    else { setLoading(false); setError('Please select an organization first.'); }
  }, [organizationId, pagination.offset]);

  async function loadCoupons() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const res = await api(`/coupons?${params}`);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.coupons || []);
        setCoupons(list);
        setPagination(prev => ({ ...prev, total: res.data?.total ?? list.length }));
      } else {
        setError(res.error?.message || 'Failed to load coupons');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.code || !form.discountValue) { setFormError('Code and discount value are required.'); return; }
    const discountValue = parseFloat(form.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) { setFormError('Enter a valid discount value.'); return; }
    try {
      setFormError('');
      setSaving(true);
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue,
        maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions, 10) : undefined,
        expiresAt: form.expiresAt || undefined,
      };
      const res = await api('/coupons', { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) {
        setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxRedemptions: '', expiresAt: '' });
        setShowCreate(false);
        toast.success('Coupon created');
        loadCoupons();
      } else {
        setFormError(res.error?.message || 'Failed to create coupon');
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
      const res = await api(`/coupons/${deleteConfirm.id}`, { method: 'DELETE' });
      if (res.success) {
        toast.success(`Coupon "${deleteConfirm.code}" deleted`);
        loadCoupons();
      } else {
        toast.error(res.error?.message || 'Failed to delete coupon');
      }
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  function formatDiscount(coupon) {
    if (coupon.discountType === 'PERCENTAGE') return `${coupon.discountValue}%`;
    return `$${(Number(coupon.discountValue) / 100).toFixed(2)}`;
  }

  const columns = [
    { key: 'code', header: 'Code', mono: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'discountType', header: 'Type', render: v => <StatusBadge status={v === 'PERCENTAGE' ? 'ACTIVE' : 'INFO'} variant={v === 'PERCENTAGE' ? 'badge-info' : 'badge-neutral'} /> },
    { key: 'discountValue', header: 'Discount', render: (v, row) => formatDiscount(row) },
    { key: 'maxRedemptions', header: 'Max uses', render: v => v ?? '—', cellClassName: 'cell-muted' },
    { key: 'timesRedeemed', header: 'Used', render: v => v ?? 0, cellClassName: 'cell-muted' },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v ? 'ACTIVE' : 'DISABLED'} /> },
    { key: 'expiresAt', header: 'Expires', render: v => v ? new Date(v).toLocaleDateString() : 'Never', cellClassName: 'cell-muted' },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <button
          onClick={e => { e.stopPropagation(); setDeleteConfirm({ id: row.id, code: row.code }); }}
          className="text-xs text-danger hover:underline"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Manage discount coupons"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>New coupon</button>}
      />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadCoupons} className="btn-secondary">Retry</button>
          </div>
        )}
        {!error && (
          <DataTable
            columns={columns}
            data={coupons}
            loading={loading}
            emptyState={
              <EmptyState
                icon={Percent}
                title="No coupons yet"
                description="Create discount coupons to offer promotions."
                action={<button className="btn-primary" onClick={() => setShowCreate(true)}>New coupon</button>}
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

      <Drawer open={showCreate} onClose={() => { setShowCreate(false); setFormError(''); }} title="Create coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Code</label>
              <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="input font-mono" autoFocus />
            </div>
            <div>
              <label className="label">Discount type</label>
              <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="select">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed amount</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{form.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Amount ($)'}</label>
              <input type="number" min="0.01" step={form.discountType === 'PERCENTAGE' ? '1' : '0.01'} value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'PERCENTAGE' ? '20' : '10.00'} className="input" />
            </div>
            <div>
              <label className="label">Max redemptions</label>
              <input type="number" min="1" value={form.maxRedemptions} onChange={e => setForm({ ...form, maxRedemptions: e.target.value })} placeholder="Unlimited" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Expires at</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="input" />
          </div>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Creating…' : 'Create coupon'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete coupon"
        description={`Delete coupon "${deleteConfirm?.code}"? This cannot be undone.`}
        confirmLabel="Delete coupon"
        confirmVariant="btn-danger"
      />
    </>
  );
}
