import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const EMPTY_FORM = {
  name: '',
  rate: '',
  country: '',
  region: '',
  active: true,
};

export default function Tax() {
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) {
      loadTaxRates();
    } else {
      setLoading(false);
      setError('Please select an organization first.');
    }
  }, [organizationId]);

  async function loadTaxRates() {
    try {
      setLoading(true);
      setError(null);
      const res = await api('/tax');
      if (res.success) {
        setTaxRates(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.error?.message || 'Failed to load tax rates');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(taxRate) {
    setEditingId(taxRate.id);
    setForm({
      name: taxRate.name || '',
      rate: taxRate.rate != null ? String(taxRate.rate) : '',
      country: taxRate.country || '',
      region: taxRate.region || '',
      active: taxRate.active !== false,
    });
    setFormError('');
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  async function handleSubmit() {
    if (!form.name || !form.rate || !form.country) {
      setFormError('Name, rate, and country are required.');
      return;
    }
    const rate = parseFloat(form.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setFormError('Rate must be a number between 0 and 100.');
      return;
    }

    try {
      setFormError('');
      setSubmitting(true);
      const payload = {
        name: form.name,
        rate,
        country: form.country,
        region: form.region || undefined,
        active: form.active,
      };

      let res;
      if (editingId) {
        res = await api(`/tax/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        res = await api('/tax', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        cancelForm();
        loadTaxRates();
      } else {
        setFormError(res.error?.message || 'Failed to save tax rate');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete tax rate "${name}"? This cannot be undone.`)) return;
    try {
      setDeleting(id);
      const res = await api(`/tax/${id}`, { method: 'DELETE' });
      if (res.success) {
        loadTaxRates();
      } else {
        alert(res.error?.message || 'Failed to delete tax rate');
      }
    } catch (e) {
      alert(e.message || 'An error occurred');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Tax Rates"
        description="Manage tax rates for billing"
        action={{
          label: '+ New Tax Rate',
          onClick: () => {
            if (showForm && !editingId) {
              cancelForm();
            } else {
              openCreate();
            }
          },
        }}
      />

      {/* Create / Edit Form */}
      {showForm && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">
            {editingId ? 'Edit Tax Rate' : 'Create Tax Rate'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. VAT, GST, Sales Tax"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Rate (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: e.target.value })}
                  placeholder="e.g. 20"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. US, GB, DE"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Region (optional)
                </label>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="e.g. CA, TX, Bayern"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="tax-active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-line text-ink focus:ring-ink/20"
              />
              <label htmlFor="tax-active" className="text-sm font-medium text-ink">
                Active
              </label>
            </div>

            {formError && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                {formError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Create Tax Rate'}
              </button>
              <button
                onClick={cancelForm}
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
          <div className="p-8 text-center text-muted">Loading tax rates…</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <div className="text-destructive mb-2">Error: {error}</div>
            <button onClick={loadTaxRates} className="btn-secondary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && taxRates.length === 0 && (
          <div className="p-8 text-center text-muted">
            No tax rates yet.{' '}
            <button
              onClick={openCreate}
              className="text-ink hover:underline"
            >
              Create your first tax rate
            </button>
          </div>
        )}

        {!loading && !error && taxRates.length > 0 && (
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rate</th>
                  <th>Country</th>
                  <th>Region</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxRates.map((tax) => (
                  <tr key={tax.id}>
                    <td className="font-medium">{tax.name}</td>
                    <td className="font-medium">{tax.rate}%</td>
                    <td className="text-muted">{tax.country}</td>
                    <td className="text-muted">{tax.region || '—'}</td>
                    <td>
                      {tax.active ? (
                        <span className="text-green-600 font-medium">✓</span>
                      ) : (
                        <span className="text-muted">✗</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(tax)}
                          className="text-sm text-ink hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tax.id, tax.name)}
                          disabled={deleting === tax.id}
                          className="text-sm text-danger hover:underline disabled:opacity-50"
                        >
                          {deleting === tax.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
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
