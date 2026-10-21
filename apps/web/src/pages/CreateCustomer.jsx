import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Building2 } from 'lucide-react';

const FIELDS = [
  { section: 'Basic information', fields: [
    { name: 'name', label: 'Customer name', type: 'text', required: true, placeholder: 'Acme Corporation' },
    { name: 'externalId', label: 'External ID', type: 'text', placeholder: 'Your internal customer ID', hint: "Your system's unique identifier for this customer" },
  ]},
  { section: 'Contact', fields: [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'contact@acme.com' },
    { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
  ]},
  { section: 'Address', fields: [
    { name: 'addressLine1', label: 'Address line 1', type: 'text', placeholder: '123 Main Street' },
    { name: 'addressLine2', label: 'Address line 2', type: 'text', placeholder: 'Suite 100' },
    { name: 'city', label: 'City', type: 'text', placeholder: 'San Francisco' },
    { name: 'state', label: 'State / Province', type: 'text', placeholder: 'CA' },
    { name: 'postalCode', label: 'Postal code', type: 'text', placeholder: '94105' },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'United States' },
  ]},
];

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const organizationId = localStorage.getItem('current_organization_id');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', externalId: '',
    addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!organizationId) { setError('Please select an organization first'); return; }
    setLoading(true);
    setError(null);
    try {
      const payload = {};
      Object.entries(formData).forEach(([key, value]) => { if (value.trim()) payload[key] = value.trim(); });
      const result = await api('/customers', { method: 'POST', body: JSON.stringify(payload) });
      if (result.success) {
        navigate(`/customers/${result.data.id}`);
      } else {
        setError(result.error?.message || 'Failed to create customer');
      }
    } catch (err) {
      setError(err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  }

  if (!organizationId) {
    return (
      <>
        <PageHeader title="New customer" />
        <EmptyState icon={Building2} title="No organization selected" description="Select an organization before creating a customer."
          action={<Link to="/organizations" className="btn-primary">Go to organizations</Link>} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="New customer"
        breadcrumbs={[{ label: 'Customers', to: '/customers' }, { label: 'New customer' }]}
      />

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        {error && (
          <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{error}</div>
        )}

        {FIELDS.map(({ section, fields }) => (
          <div key={section} className="card">
            <div className="card-header"><h2 className="text-sm font-semibold text-ink">{section}</h2></div>
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ name, label, type, required, placeholder, hint }) => (
                <div key={name} className={name === 'addressLine1' || name === 'addressLine2' ? 'md:col-span-2' : ''}>
                  <label htmlFor={name} className="label">
                    {label}{required && <span className="text-danger ml-1">*</span>}
                  </label>
                  <input
                    type={type}
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={name === 'externalId' ? 'input font-mono' : 'input'}
                    placeholder={placeholder}
                    required={required}
                    autoFocus={name === 'name'}
                  />
                  {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <button type="submit" disabled={loading || !formData.name.trim()} className="btn-primary disabled:opacity-50">
            {loading ? 'Creating…' : 'Create customer'}
          </button>
          <button type="button" onClick={() => navigate('/customers')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
