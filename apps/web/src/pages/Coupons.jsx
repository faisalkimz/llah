import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxRedemptions: '',
    expiresAt: '',
  });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) {
      loadCoupons();
    } else {
      setLoading(false);
      setError('Please select an organization first.');
    }
  }, [organizationId]);

  async function loadCoupons() {
    try {
      setLoading(true);
      setError(null);
      const res = await api('/coupons');
      if (res.success) {
        setCoupons(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.error?.message || 'Failed to load coupons');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.code || !form.discountValue) {
      setFormError('Code and discount value are required.');
      return;
    }
    const discountValue = parseFloat(form.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      setFormError('Please enter a valid discount value.');
      return;
    }

    try {
      setFormError('');
      setSubmitting(true);
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue,
        maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions) : undefined,
        expiresAt: form.expiresAt || undefined,
      };
      const res = await api('/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxRedemptions: '', expiresAt: '' });
        setShowCreate(false);
        loadCoupons();
      } else {
        setFormError(res.error?.message || 'Failed to create coupon');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, code) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      setDeleting(id);
      const res = await api(`/coupons/${id}`, { method: 'DELETE' });
      if (res.success) {
        loadCoupons();
      } else {
        alert(res.error?.message || 'Failed to delete coupon');
      }
    } catch (e) {
      alert(e.message || 'An error occurred');
    } finally {
      setDeleting(null);
    }
  }

  function formatDiscount(coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    }
    return `$${(Number(coupon.discountValue) / 100).toFixed(2)}`;
  }

  function discountTypeBadge(type) {
    if (type === 'PERCENTAGE') {
      return (
        <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
          PERCENTAGE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-700">
        FIXED
      </span>
    );
  }

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Manage discount coupons"
        action={{
          label: '+ New Coupon',
          onClick: () => {
            setShowCreate((v) => !v);
            setFormError('');
          },
        }}
      />

      {/* Create Form */}
      {showCreate && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Create Coupon</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Discount Type *
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  {form.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount Amount ($)'} *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step={form.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === 'PERCENTAGE' ? '20' : '10.00'}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Max Redemptions (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxRedemptions}
                  onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
                  placeholder="Leave blank for unlimited"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Expires At (optional)
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
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
                {submitting ? 'Creating…' : 'Create Coupon'}
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
          <div className="p-8 text-center text-muted">Loading coupons…</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <div className="text-destructive mb-2">Error: {error}</div>
            <button onClick={loadCoupons} className="btn-secondary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && coupons.length === 0 && (
          <div className="p-8 text-center text-muted">
            No coupons yet.{' '}
            <button
              onClick={() => setShowCreate(true)}
              className="text-ink hover:underline"
            >
              Create your first coupon
            </button>
          </div>
        )}

        {!loading && !error && coupons.length > 0 && (
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount Type</th>
                  <th>Value</th>
                  <th>Max Redemptions</th>
                  <th>Used</th>
                  <th>Expires</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="font-mono font-semibold">{coupon.code}</td>
                    <td>{discountTypeBadge(coupon.discountType)}</td>
                    <td className="font-medium">{formatDiscount(coupon)}</td>
                    <td className="text-muted">
                      {coupon.maxRedemptions != null ? coupon.maxRedemptions : '—'}
                    </td>
                    <td className="text-muted">{coupon.timesRedeemed ?? 0}</td>
                    <td className="text-muted">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      {coupon.active ? (
                        <span className="text-green-600 font-medium">✓</span>
                      ) : (
                        <span className="text-muted">✗</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        disabled={deleting === coupon.id}
                        className="text-sm text-danger hover:underline disabled:opacity-50"
                      >
                        {deleting === coupon.id ? 'Deleting…' : 'Delete'}
                      </button>
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
