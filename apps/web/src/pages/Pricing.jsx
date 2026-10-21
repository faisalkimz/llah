import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Drawer from '../components/ui/Drawer.jsx';

function fmt(minor) {
  return (Number(minor || 0) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Pricing() {
  const { api } = useAuth();
  const toast = useToast();
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ productId: '', meterId: '', name: '', currency: 'USD', billingScheme: 'per_unit', unitAmountMinor: '', active: true });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  useEffect(() => { loadData(); }, [pagination.offset]);

  async function loadData() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const [pricesRes, productsRes, metersRes] = await Promise.all([
        api(`/pricing?${params}`),
        api('/products?limit=100'),
        api('/meters?limit=100'),
      ]);
      if (pricesRes.success) {
        const list = pricesRes.data?.prices || (Array.isArray(pricesRes.data) ? pricesRes.data : []);
        setPrices(list);
        setPagination(prev => ({ ...prev, total: pricesRes.data?.total ?? list.length }));
      }
      if (productsRes.success) setProducts(productsRes.data?.products || []);
      if (metersRes.success) setMeters(metersRes.data?.meters || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.productId || !form.name) { setFormError('Product and name are required'); return; }
    const unitAmountMinor = parseInt(form.unitAmountMinor, 10);
    if (form.billingScheme === 'per_unit' && (isNaN(unitAmountMinor) || unitAmountMinor < 0)) {
      setFormError('Enter a valid unit amount in cents');
      return;
    }
    try {
      setFormError('');
      setSaving(true);
      const response = await api('/pricing', {
        method: 'POST',
        body: JSON.stringify({ ...form, unitAmountMinor: form.billingScheme === 'per_unit' ? unitAmountMinor : undefined, meterId: form.meterId || undefined }),
      });
      if (response.success) {
        setForm({ productId: '', meterId: '', name: '', currency: 'USD', billingScheme: 'per_unit', unitAmountMinor: '', active: true });
        setShowCreate(false);
        toast.success('Price created');
        loadData();
      } else {
        setFormError(response.error?.message || 'Failed to create price');
      }
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'productId', header: 'Product', render: (v, row) => {
      const p = products.find(p => p.id === v);
      return p ? p.name : <span className="font-mono text-xs text-muted">{v?.slice(0, 12)}</span>;
    }},
    { key: 'unitAmountMinor', header: 'Unit price', render: v => v != null ? <span className="tabular-nums">{fmt(v)}</span> : '—' },
    { key: 'billingScheme', header: 'Scheme', cellClassName: 'cell-muted' },
    { key: 'currency', header: 'Currency', cellClassName: 'cell-muted' },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v ? 'ACTIVE' : 'DISABLED'} /> },
  ];

  return (
    <>
      <PageHeader
        title="Pricing"
        description="Manage price configurations"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create price</button>}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={prices}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Tag}
              title="No prices yet"
              description="Create prices to attach to products and subscription plans."
              action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create price</button>}
            />
          }
        />
        {!loading && pagination.total > pagination.limit && (
          <TablePagination offset={pagination.offset} limit={pagination.limit} total={pagination.total} onPageChange={offset => setPagination(prev => ({ ...prev, offset }))} />
        )}
      </div>

      <Drawer open={showCreate} onClose={() => { setShowCreate(false); setFormError(''); }} title="Create price">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Product</label>
            <select value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))} className="select">
              <option value="">Select a product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Monthly subscription" className="input" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className="select">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="label">Billing scheme</label>
              <select value={form.billingScheme} onChange={e => setForm(p => ({ ...p, billingScheme: e.target.value }))} className="select">
                <option value="per_unit">Per unit</option>
                <option value="tiered">Tiered</option>
              </select>
            </div>
          </div>
          {form.billingScheme === 'per_unit' && (
            <div>
              <label className="label">Unit amount (cents)</label>
              <input type="number" min="0" value={form.unitAmountMinor} onChange={e => setForm(p => ({ ...p, unitAmountMinor: e.target.value }))} placeholder="e.g. 999 = $9.99" className="input" />
            </div>
          )}
          <div>
            <label className="label">Meter (optional)</label>
            <select value={form.meterId} onChange={e => setForm(p => ({ ...p, meterId: e.target.value }))} className="select">
              <option value="">None (flat rate)</option>
              {meters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="h-4 w-4 rounded border-line" />
            <span className="text-sm text-ink">Active</span>
          </label>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Creating…' : 'Create price'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
