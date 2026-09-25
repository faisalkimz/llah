import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Products() {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', active: true });
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await api('/products');
      if (response.success) {
        // API returns { products: [...], pagination: {...} }
        const productsArray = response.data?.products || [];
        setProducts(Array.isArray(productsArray) ? productsArray : []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createProduct() {
    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }

    try {
      setError('');
      const response = await api('/products', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      if (response.success) {
        setForm({ name: '', description: '', active: true });
        setShowCreate(false);
        loadProducts();
      } else {
        setError(response.error.message);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleActive(productId, currentActive) {
    try {
      const response = await api(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !currentActive })
      });

      if (response.success) {
        loadProducts();
      }
    } catch (e) {
      console.error('Failed to update product:', e);
    }
  }

  return (
    <>
      <PageHeader 
        title="Products" 
        description="Manage your product catalog"
        action={{
          label: '+ Create Product',
          onClick: () => setShowCreate(true)
        }}
      />

      {/* Create Form */}
      {showCreate && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Create New Product</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Starter Plan, Pro Plan"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your product..."
                rows={3}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 text-ink border-line rounded focus:ring-ink"
              />
              <label htmlFor="active" className="text-sm text-ink">
                Active
              </label>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={createProduct}
                className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors"
              >
                Create Product
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setError('');
                  setForm({ name: '', description: '', active: true });
                }}
                className="px-4 py-2 border border-line rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted mb-4">No products yet</div>
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm text-ink hover:underline"
            >
              Create your first product
            </button>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="llah-card p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-ink">{product.name}</h3>
                <button
                  onClick={() => toggleActive(product.id, product.active)}
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    product.active
                      ? 'bg-success/10 text-success'
                      : 'bg-neutral-100 text-muted'
                  }`}
                >
                  {product.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              
              {product.description && (
                <p className="text-sm text-muted mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="text-xs text-muted">
                Created {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
