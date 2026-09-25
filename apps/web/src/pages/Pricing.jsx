import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Pricing() {
  const { api } = useAuth();
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    meterId: '',
    name: '',
    currency: 'USD',
    billingScheme: 'per_unit',
    unitAmountMinor: '',
    active: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [pricesRes, productsRes, metersRes] = await Promise.all([
        api('/pricing'),
        api('/products'),
        api('/meters')
      ]);

      // Pricing API returns { prices: [...], pagination: {...} }
      if (pricesRes.success) {
        const pricesArray = pricesRes.data?.prices || [];
        setPrices(Array.isArray(pricesArray) ? pricesArray : []);
      }
      // Products API returns { products: [...], pagination: {...} }
      if (productsRes.success) {
        const productsArray = productsRes.data?.products || [];
        setProducts(Array.isArray(productsArray) ? productsArray : []);
      }
      // Meters API returns { meters: [...], pagination: {...} }
      if (metersRes.success) {
        const metersArray = metersRes.data?.meters || [];
        setMeters(Array.isArray(metersArray) ? metersArray : []);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createPrice() {
    if (!form.productId || !form.name) {
      setError('Product and name are required');
      return;
    }

    try {
      setError('');
      const payload = {
        ...form,
        unitAmountMinor: form.unitAmountMinor ? parseInt(form.unitAmountMinor) : undefined
      };

      const response = await api('/pricing', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        setForm({
          productId: '',
          meterId: '',
          name: '',
          currency: 'USD',
          billingScheme: 'per_unit',
          unitAmountMinor: '',
          active: true
        });
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
        title="Pricing" 
        description="Configure pricing for your products"
        action={{
          label: '+ Create Price',
          onClick: () => setShowCreate(true)
        }}
      />

      {/* Create Form */}
      {showCreate && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Create New Price</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Product *
              </label>
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Meter (optional)
              </label>
              <select
                value={form.meterId}
                onChange={(e) => setForm({ ...form, meterId: e.target.value })}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              >
                <option value="">No meter (flat pricing)</option>
                {meters.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.key})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Price Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Per API Call, Monthly Fee"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Billing Scheme
                </label>
                <select
                  value={form.billingScheme}
                  onChange={(e) => setForm({ ...form, billingScheme: e.target.value })}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  <option value="flat">Flat Fee</option>
                  <option value="per_unit">Per Unit</option>
                  <option value="tiered">Tiered</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Unit Amount (in cents)
              </label>
              <input
                type="number"
                value={form.unitAmountMinor}
                onChange={(e) => setForm({ ...form, unitAmountMinor: e.target.value })}
                placeholder="100 = $1.00"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
              <p className="text-xs text-muted mt-1">Enter amount in minor units (cents)</p>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={createPrice}
                className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors"
              >
                Create Price
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

      {/* Prices List */}
      <div className="llah-card">
        <div className="overflow-x-auto">
          <table className="llah-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Product</th>
                <th>Meter</th>
                <th>Scheme</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    Loading prices...
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-muted mb-2">No prices yet</div>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="text-sm text-ink hover:underline"
                    >
                      Create your first price
                    </button>
                  </td>
                </tr>
              ) : (
                prices.map((price) => (
                  <tr key={price.id}>
                    <td className="font-medium">{price.name}</td>
                    <td>{price.product?.name || '-'}</td>
                    <td>{price.meter?.name || '-'}</td>
                    <td className="capitalize">{price.billingScheme.replace('_', ' ')}</td>
                    <td>
                      {price.unitAmountMinor 
                        ? `$${(price.unitAmountMinor / 100).toFixed(2)}`
                        : '-'
                      }
                    </td>
                    <td>
                      {price.active ? (
                        <span className="text-success">Active</span>
                      ) : (
                        <span className="text-muted">Inactive</span>
                      )}
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
