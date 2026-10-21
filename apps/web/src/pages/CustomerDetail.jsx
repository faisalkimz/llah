import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId && id) loadCustomer();
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
          name: data.name || '', email: data.email || '', phone: data.phone || '',
          externalId: data.externalId || '', addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '', city: data.city || '',
          state: data.state || '', postalCode: data.postalCode || '', country: data.country || '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      Object.entries(formData).forEach(([key, value]) => {
        const v = value.trim();
        if (v && v !== (customer[key] || '')) payload[key] = v;
      });
      if (Object.keys(payload).length === 0) { setEditing(false); return; }
      const result = await api(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      if (result.success) {
        setCustomer(result.data);
        setEditing(false);
        toast.success('Customer updated');
      } else {
        toast.error(result.error?.message || 'Failed to update customer');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await api(`/customers/${id}`, { method: 'DELETE' });
      if (result.success) {
        toast.success('Customer deleted');
        navigate('/customers');
      } else {
        toast.error(result.error?.message || 'Failed to delete customer');
        setDeleting(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer');
      setDeleting(false);
    } finally {
      setDeleteConfirm(false);
    }
  }

  if (!organizationId) {
    return (
      <div className="card p-8 text-center text-muted">
        Please select an organization first. <Link to="/organizations" className="text-accent hover:underline">Go to Organizations</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Customer" />
        <div className="grid grid-cols-3 gap-4 mb-6">{[0,1,2].map(i=><SkeletonCard key={i}/>)}</div>
      </>
    );
  }

  if (error || !customer) {
    return (
      <div className="card p-8 text-center">
        <div className="text-danger mb-3">{error || 'Customer not found'}</div>
        <Link to="/customers" className="btn-secondary">Back to customers</Link>
      </div>
    );
  }

  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'externalId', label: 'External ID' },
    { name: 'addressLine1', label: 'Address line 1' },
    { name: 'addressLine2', label: 'Address line 2' },
    { name: 'city', label: 'City' },
    { name: 'state', label: 'State / Province' },
    { name: 'postalCode', label: 'Postal code' },
    { name: 'country', label: 'Country' },
  ];

  return (
    <>
      <PageHeader
        title={customer.name}
        breadcrumbs={[{ label: 'Customers', to: '/customers' }, { label: customer.name }]}
        action={
          !editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="btn-secondary">Edit</button>
              <button onClick={() => setDeleteConfirm(true)} disabled={deleting} className="btn-danger disabled:opacity-50">Delete</button>
            </div>
          ) : null
        }
      />

      {customer._count && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Subscriptions" value={customer._count.subscriptions ?? 0} />
          <StatCard label="Invoices" value={customer._count.invoices ?? 0} />
          <StatCard label="Usage events" value={customer._count.usageEvents ?? 0} />
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Customer details</h2>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ name, label, type = 'text', required }) => (
              <div key={name}>
                <label className="label">{label}</label>
                {editing ? (
                  <input
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                    className={name === 'externalId' ? 'input font-mono' : 'input'}
                    required={required}
                  />
                ) : (
                  <div className={`text-sm ${name === 'externalId' ? 'font-mono text-muted' : 'text-ink'}`}>
                    {customer[name] || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted">
              <div>Created: <span className="text-ink ml-1">{new Date(customer.createdAt).toLocaleString()}</span></div>
              <div>Updated: <span className="text-ink ml-1">{new Date(customer.updatedAt).toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3">
            <button type="submit" disabled={saving || !formData.name?.trim()} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        )}
      </form>

      <ConfirmModal
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete customer"
        description={`Delete ${customer.name}? This action cannot be undone.`}
        confirmLabel="Delete customer"
        confirmVariant="btn-danger"
      />
    </>
  );
}
