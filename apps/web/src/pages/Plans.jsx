import { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Drawer from '../components/ui/Drawer.jsx';

export default function Plans() {
  const { api } = useAuth();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', active: true });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setError(null);
      const response = await api('/plans');
      if (response.success) {
        setPlans(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error?.message || 'Failed to load plans');
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
      setFormError('Plan name is required');
      return;
    }
    try {
      setFormError('');
      setSaving(true);
      const response = await api('/plans', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (response.success) {
        setForm({ name: '', description: '', active: true });
        setShowCreate(false);
        toast.success('Plan created');
        loadPlans();
      } else {
        setFormError(response.error?.message || 'Failed to create plan');
      }
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    {
      key: 'items',
      header: 'Prices',
      render: (v, row) => <span className="tabular-nums">{Array.isArray(row.items) ? row.items.length : '—'}</span>,
    },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v ? 'ACTIVE' : 'DISABLED'} /> },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Subscription plans"
        description="Manage subscription plan bundles"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create plan</button>}
      />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadPlans} className="btn-secondary">Retry</button>
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={plans}
            loading={loading}
            emptyState={
              <EmptyState
                icon={Sliders}
                title="No plans yet"
                description="Create subscription plans to bundle pricing tiers."
                action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create plan</button>}
              />
            }
          />
        )}
      </div>

      <Drawer
        open={showCreate}
        onClose={() => { setShowCreate(false); setFormError(''); }}
        title="Create plan"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Plan name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Pro plan"
              className="input"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe this plan..."
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
              {saving ? 'Creating…' : 'Create plan'}
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
