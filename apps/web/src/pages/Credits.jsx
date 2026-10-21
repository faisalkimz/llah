import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Drawer from '../components/ui/Drawer.jsx';

function fmt(minor, currency) {
  const n = Number(minor || 0);
  return (n / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

export default function Credits() {
  const { api } = useAuth();
  const toast = useToast();
  const [grants, setGrants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customerId: '', currency: 'USD', amountMinor: '', reason: '', expiresAt: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  useEffect(() => { loadData(); }, [pagination.offset]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const [grantsRes, customersRes] = await Promise.all([
        api(`/credits?${params}`),
        api('/customers?limit=100'),
      ]);
      if (grantsRes.success) {
        const list = Array.isArray(grantsRes.data) ? grantsRes.data : (grantsRes.data?.credits || []);
        setGrants(list);
        setPagination(prev => ({ ...prev, total: grantsRes.data?.total ?? list.length }));
      } else {
        setError(grantsRes.error?.message || 'Failed to load credits');
      }
      if (customersRes.success) {
        setCustomers(customersRes.data?.customers || []);
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.customerId || !form.amountMinor) {
      setFormError('Customer and amount are required.');
      return;
    }
    const amountMinor = parseInt(form.amountMinor, 10);
    if (isNaN(amountMinor) || amountMinor <= 0) {
      setFormError('Enter a valid positive amount in cents.');
      return;
    }
    try {
      setFormError('');
      setSaving(true);
      const res = await api('/credits', {
        method: 'POST',
        body: JSON.stringify({ ...form, amountMinor, expiresAt: form.expiresAt || undefined }),
      });
      if (res.success) {
        setForm({ customerId: '', currency: 'USD', amountMinor: '', reason: '', expiresAt: '' });
        setShowCreate(false);
        toast.success('Credit granted');
        loadData();
      } else {
        setFormError(res.error?.message || 'Failed to grant credit');
      }
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'customerId', header: 'Customer', render: (v, row) => {
      const c = customers.find(c => c.id === v);
      return c ? c.name : <span className="cell-mono">{v?.slice(0, 12)}</span>;
    }},
    { key: 'amountMinor', header: 'Amount', render: (v, row) => <span className="tabular-nums">{fmt(v, row.currency)}</span> },
    { key: 'remainingMinor', header: 'Remaining', render: (v, row) => <span className="tabular-nums text-success">{fmt(v, row.currency)}</span> },
    { key: 'reason', header: 'Reason', render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'expiresAt', header: 'Expires', render: v => v ? new Date(v).toLocaleDateString() : 'Never', cellClassName: 'cell-muted' },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Credits"
        description="Manage customer credit grants"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Grant credits</button>}
      />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadData} className="btn-secondary">Retry</button>
          </div>
        )}
        {!error && (
          <DataTable
            columns={columns}
            data={grants}
            loading={loading}
            emptyState={
              <EmptyState
                icon={DollarSign}
                title="No credit grants yet"
                description="Grant credits to customers to offset future invoices."
                action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Grant credits</button>}
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

      <Drawer open={showCreate} onClose={() => { setShowCreate(false); setFormError(''); }} title="Grant credits">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Customer</label>
            <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="select">
              <option value="">Select a customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (in cents)</label>
              <input type="number" value={form.amountMinor} onChange={e => setForm({ ...form, amountMinor: e.target.value })} placeholder="1000 = $10.00" className="input" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="select">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g., Welcome bonus" className="input" />
          </div>
          <div>
            <label className="label">Expires at (optional)</label>
            <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="input" />
          </div>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Granting…' : 'Grant credits'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
