import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Drawer from '../components/ui/Drawer.jsx';

export default function Products() {
  const { api } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', active: true });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  useEffect(() => {
    loadProducts();
  }, [pagination.offset]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      const response = await api(`/products?${params}`);
      if (response.success) {
        const list = response.data?.products || (Array.isArray(response.data) ? response.data : []);
        setProducts(list);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total ?? response.meta?.total ?? list.length,
        }));
      } else {
        setError(response.error?.message || 'Failed to load products');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Product name is required');
      return;
    }
    try {
      setFormError('');
      setSaving(true);
      const response = await api('/products', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (response.success) {
        setForm({ name: '', description: '', active: true });
        setShowCreate(false);
        toast.success('Product created');
        loadProducts();
      } else {
        setFormError(response.error?.message || 'Failed to create product');
      }
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'description', header: 'Description', render: v => v ? <span className="text-muted text-sm truncate max-w-xs block">{v}</span> : '—' },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v ? 'ACTIVE' : 'DISABLED'} /> },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create product</button>}
      />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadProducts} className="btn-secondary">Retry</button>
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            emptyState={
              <EmptyState
                icon={Database}
                title="No products yet"
                description="Create your first product to start billing customers."
                action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create product</button>}
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
        open={showCreate}
        onClose={() => { setShowCreate(false); setFormError(''); }}
        title="Create product"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Product name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Starter plan"
              className="input"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your product..."
              rows={3}
              className="textarea"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-line"
            />
            <span className="text-sm text-ink">Active</span>
          </label>
          {formError && (
            <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">
              {formError}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Creating…' : 'Create product'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
