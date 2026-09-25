import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Credits() {
  const { api } = useAuth();
  const [grants, setGrants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    currency: 'USD',
    amountMinor: '',
    reason: '',
    expiresAt: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [grantsRes, customersRes] = await Promise.all([
        api('/credits'),
        api('/customers')
      ]);

      if (grantsRes.success) setGrants(Array.isArray(grantsRes.data) ? grantsRes.data : []);
      // Customers API returns { customers: [...], total, limit, offset }
      if (customersRes.success) {
        const customersList = customersRes.data?.customers || [];
        setCustomers(Array.isArray(customersList) ? customersList : []);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createGrant() {
    if (!form.customerId || !form.amountMinor) {
      setError('Customer and amount are required');
      return;
    }

    try {
      setError('');
      const payload = {
        ...form,
        amountMinor: parseInt(form.amountMinor),
        expiresAt: form.expiresAt || undefined
      };

      const response = await api('/credits', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        setForm({ customerId: '', currency: 'USD', amountMinor: '', reason: '', expiresAt: '' });
        setShowCreate(false);
        loadData();
      } else {
        setError(response.error.message);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageHeader 
        title="Credits" 
        description="Manage customer credit grants"
        action={{
          label: '+ Grant Credits',
          onClick: () => setShowCreate(true)
        }}
      />

      {/* Create Form */}
      {showCreate && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Grant Credits to Customer</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Customer *
              </label>
              <select
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Amount (in cents) *
                </label>
                <input
                  type="number"
                  value={form.amountMinor}
                  onChange={(e) => setForm({ ...form, amountMinor: e.target.value })}
                  placeholder="1000 = $10.00"
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Reason
              </label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g., Welcome bonus, Service credit"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={createGrant}
                className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors"
              >
                Grant Credits
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setError('');
                }}
                className="px-4 py-2 border border-line rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grants List */}
      <div className="llah-card">
        <div className="overflow-x-auto">
          <table className="llah-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Remaining</th>
                <th>Reason</th>
                <th>Expires</th>
                <th>Granted</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    Loading credits...
                  </td>
                </tr>
              ) : grants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-muted mb-2">No credit grants yet</div>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="text-sm text-ink hover:underline"
                    >
                      Grant your first credits
                    </button>
                  </td>
                </tr>
              ) : (
                grants.map((grant) => (
                  <tr key={grant.id}>
                    <td>{grant.customerId}</td>
                    <td className="font-medium">
                      ${(Number(grant.amountMinor) / 100).toFixed(2)} {grant.currency}
                    </td>
                    <td className="text-success font-medium">
                      ${(Number(grant.remainingMinor) / 100).toFixed(2)}
                    </td>
                    <td className="text-muted">{grant.reason || '-'}</td>
                    <td className="text-muted">
                      {grant.expiresAt ? new Date(grant.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="text-muted">
                      {new Date(grant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
