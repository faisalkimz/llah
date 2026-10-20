import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amountDollars: '',
    type: 'CREDIT',
    reason: '',
    invoiceId: '',
  });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) {
      loadAdjustments();
    } else {
      setLoading(false);
      setError('Please select an organization first.');
    }
  }, [organizationId]);

  async function loadAdjustments() {
    try {
      setLoading(true);
      setError(null);
      const res = await api('/adjustments');
      if (res.success) {
        setAdjustments(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.error?.message || 'Failed to load adjustments');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.amountDollars || !form.type) {
      setFormError('Amount and type are required.');
      return;
    }
    const amountMinor = Math.round(parseFloat(form.amountDollars) * 100);
    if (isNaN(amountMinor) || amountMinor <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    try {
      setFormError('');
      setSubmitting(true);
      const payload = {
        amountMinor,
        type: form.type,
        reason: form.reason || undefined,
        invoiceId: form.invoiceId || undefined,
      };
      const res = await api('/adjustments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setForm({ amountDollars: '', type: 'CREDIT', reason: '', invoiceId: '' });
        setShowCreate(false);
        loadAdjustments();
      } else {
        setFormError(res.error?.message || 'Failed to create adjustment');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  function typeBadge(type) {
    if (type === 'CREDIT') {
      return (
        <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
          CREDIT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-700">
        DEBIT
      </span>
    );
  }

  return (
    <>
      <PageHeader
        title="Adjustments"
        description="Manage billing adjustments"
        action={{
          label: '+ New Adjustment',
          onClick: () => {
            setShowCreate((v) => !v);
            setFormError('');
          },
        }}
      />

      {/* Create Form */}
      {showCreate && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Create Adjustment</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amountDollars}
                  onChange={(e) => setForm({ ...form, amountDollars: e.target.value })}
                  placeholder="e.g. 10.00"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  <option value="CREDIT">CREDIT</option>
                  <option value="DEBIT">DEBIT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Reason</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Describe the reason for this adjustment"
                rows={3}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Invoice ID (optional)
              </label>
              <input
                type="text"
                value={form.invoiceId}
                onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
                placeholder="Link to an invoice (optional)"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>

            {formError && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                {formError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create Adjustment'}
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setFormError('');
                }}
                className="px-4 py-2 border border-line rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="llah-card">
        {loading && (
          <div className="p-8 text-center text-muted">Loading adjustments…</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <div className="text-destructive mb-2">Error: {error}</div>
            <button onClick={loadAdjustments} className="btn-secondary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && adjustments.length === 0 && (
          <div className="p-8 text-center text-muted">
            No adjustments yet.{' '}
            <button
              onClick={() => setShowCreate(true)}
              className="text-ink hover:underline"
            >
              Create your first adjustment
            </button>
          </div>
        )}

        {!loading && !error && adjustments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Invoice ID</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj) => (
                  <tr key={adj.id}>
                    <td className="font-medium">
                      ${(Number(adj.amountMinor) / 100).toFixed(2)}
                    </td>
                    <td>{typeBadge(adj.type)}</td>
                    <td className="text-muted max-w-xs truncate">
                      {adj.reason || '—'}
                    </td>
                    <td className="text-muted font-mono text-xs">
                      {adj.invoiceId
                        ? adj.invoiceId.length > 16
                          ? `${adj.invoiceId.slice(0, 16)}…`
                          : adj.invoiceId
                        : '—'}
                    </td>
                    <td className="text-muted">
                      {new Date(adj.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
