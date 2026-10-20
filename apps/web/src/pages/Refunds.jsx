import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(null); // id being processed
  const [form, setForm] = useState({
    paymentId: '',
    amountDollars: '',
    reason: '',
  });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) {
      loadRefunds();
    } else {
      setLoading(false);
      setError('Please select an organization first.');
    }
  }, [organizationId]);

  async function loadRefunds() {
    try {
      setLoading(true);
      setError(null);
      const res = await api('/refunds');
      if (res.success) {
        setRefunds(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.error?.message || 'Failed to load refunds');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.paymentId || !form.amountDollars) {
      setFormError('Payment ID and amount are required.');
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
        paymentId: form.paymentId,
        amountMinor,
        reason: form.reason || undefined,
      };
      const res = await api('/refunds', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setForm({ paymentId: '', amountDollars: '', reason: '' });
        setShowCreate(false);
        loadRefunds();
      } else {
        setFormError(res.error?.message || 'Failed to create refund');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProcess(id) {
    if (!confirm('Process this refund now?')) return;
    try {
      setProcessing(id);
      const res = await api(`/refunds/${id}/process`, { method: 'POST' });
      if (res.success) {
        loadRefunds();
      } else {
        alert(res.error?.message || 'Failed to process refund');
      }
    } catch (e) {
      alert(e.message || 'An error occurred');
    } finally {
      setProcessing(null);
    }
  }

  function statusBadge(status) {
    const map = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      SUCCEEDED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    const cls = map[status] || 'bg-neutral-100 text-muted';
    return (
      <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded ${cls}`}>
        {status}
      </span>
    );
  }

  return (
    <>
      <PageHeader
        title="Refunds"
        description="Manage payment refunds"
        action={{
          label: '+ New Refund',
          onClick: () => {
            setShowCreate((v) => !v);
            setFormError('');
          },
        }}
      />

      {/* Create Form */}
      {showCreate && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Create Refund</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Payment ID *
              </label>
              <input
                type="text"
                value={form.paymentId}
                onChange={(e) => setForm({ ...form, paymentId: e.target.value })}
                placeholder="Payment ID to refund"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>

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
                placeholder="e.g. 25.00"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Reason</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Describe the reason for this refund"
                rows={3}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 resize-none"
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
                {submitting ? 'Creating…' : 'Create Refund'}
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
          <div className="p-8 text-center text-muted">Loading refunds…</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <div className="text-destructive mb-2">Error: {error}</div>
            <button onClick={loadRefunds} className="btn-secondary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && refunds.length === 0 && (
          <div className="p-8 text-center text-muted">
            No refunds yet.{' '}
            <button
              onClick={() => setShowCreate(true)}
              className="text-ink hover:underline"
            >
              Create your first refund
            </button>
          </div>
        )}

        {!loading && !error && refunds.length > 0 && (
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Payment ID</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => (
                  <tr key={refund.id}>
                    <td className="font-medium">
                      ${(Number(refund.amountMinor) / 100).toFixed(2)}
                    </td>
                    <td className="text-muted max-w-xs truncate">
                      {refund.reason || '—'}
                    </td>
                    <td className="text-muted font-mono text-xs">
                      {refund.paymentId
                        ? refund.paymentId.length > 16
                          ? `${refund.paymentId.slice(0, 16)}…`
                          : refund.paymentId
                        : '—'}
                    </td>
                    <td>{statusBadge(refund.status)}</td>
                    <td className="text-muted">
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {refund.status === 'PENDING' && (
                        <button
                          onClick={() => handleProcess(refund.id)}
                          disabled={processing === refund.id}
                          className="text-sm text-ink hover:underline disabled:opacity-50"
                        >
                          {processing === refund.id ? 'Processing…' : 'Process'}
                        </button>
                      )}
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
