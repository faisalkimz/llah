import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId && id) {
      loadCustomer();
    }
  }, [organizationId, id]);

  async function loadCustomer() {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api(`/customers/${id}`);
      
      if (result.success) {
        const data = result.data;
        setCustomer(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          externalId: data.externalId || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          country: data.country || '',
        });
      } else {
        setError(result.error?.message || 'Failed to load customer');
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      // Filter out empty string values and unchanged values
      const payload = {};
      Object.entries(formData).forEach(([key, value]) => {
        const trimmedValue = value.trim();
        if (trimmedValue && trimmedValue !== (customer[key] || '')) {
          payload[key] = trimmedValue;
        }
      });

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }

      const result = await api(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (result.success) {
        setCustomer(result.data);
        setEditing(false);
      } else {
        setSaveError(result.error?.message || 'Failed to update customer');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditing(false);
    setSaveError(null);
    // Reset form data to current customer values
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      externalId: customer.externalId || '',
      addressLine1: customer.addressLine1 || '',
      addressLine2: customer.addressLine2 || '',
      city: customer.city || '',
      state: customer.state || '',
      postalCode: customer.postalCode || '',
      country: customer.country || '',
    });
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeleting(true);
    
    try {
      const result = await api(`/customers/${id}`, {
        method: 'DELETE',
      });
      
      if (result.success) {
        navigate('/customers');
      } else {
        alert(result.error?.message || 'Failed to delete customer');
        setDeleting(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete customer');
      setDeleting(false);
    }
  }

  if (!organizationId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select an organization first</p>
          <Link to="/organizations" className="text-black hover:underline">
            Go to Organizations
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center text-gray-500">Loading customer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link to="/customers" className="text-black hover:underline">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Customer not found</div>
          <Link to="/customers" className="text-black hover:underline">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link to="/customers" className="hover:text-gray-900">
            Customers
          </Link>
          <span>/</span>
          <span className="text-gray-900">{customer.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
            {customer.externalId && (
              <p className="text-sm text-gray-500 mt-1">ID: {customer.externalId}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {customer._count && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {customer._count.subscriptions || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Subscriptions</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {customer._count.invoices || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Invoices</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {customer._count.usageEvents || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Usage Events</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Save Error */}
        {saveError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {saveError}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              ) : (
                <div className="text-gray-900">{customer.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                External ID
              </label>
              {editing ? (
                <input
                  type="text"
                  name="externalId"
                  value={formData.externalId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              ) : (
                <div className="text-gray-900">{customer.externalId || '—'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              ) : (
                <div className="text-gray-900">{customer.email || '—'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              ) : (
                <div className="text-gray-900">{customer.phone || '—'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              {editing ? (
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              ) : (
                <div className="text-gray-900">{customer.addressLine1 || '—'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              {editing ? (
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              ) : (
                <div className="text-gray-900">{customer.addressLine2 || '—'}</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                {editing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{customer.city || '—'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State / Province
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{customer.state || '—'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{customer.postalCode || '—'}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              {editing ? (
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              ) : (
                <div className="text-gray-900">{customer.country || '—'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 text-gray-900">
                {new Date(customer.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <span className="ml-2 text-gray-900">
                {new Date(customer.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {editing && (
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
