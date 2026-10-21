import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const AGGREGATION_TYPES = [
  { value: 'SUM',    label: 'Sum',     description: 'Add up all values (e.g., total API calls)' },
  { value: 'COUNT',  label: 'Count',   description: 'Count number of events (e.g., transactions)' },
  { value: 'MAX',    label: 'Maximum', description: 'Highest value in period (e.g., peak users)' },
  { value: 'LATEST', label: 'Latest',  description: 'Most recent value (e.g., current storage)' },
];

export default function CreateMeter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const organizationId = localStorage.getItem('current_organization_id');
  const [formData, setFormData] = useState({ key: '', name: '', unit: '', aggregation: 'SUM' });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleKeyChange(e) {
    let value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+/, '').replace(/_+/g, '_');
    setFormData(prev => ({ ...prev, key: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!organizationId) { setError('Please select an organization first'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await api('/meters', { method: 'POST', body: JSON.stringify(formData) });
      if (result.success) {
        navigate(`/meters/${result.data.id}`);
      } else {
        setError(result.error?.message || 'Failed to create meter');
      }
    } catch (err) {
      setError(err.message || 'Failed to create meter');
    } finally {
      setLoading(false);
    }
  }

  if (!organizationId) {
    return (
      <>
        <PageHeader title="Create meter" />
        <EmptyState icon={Gauge} title="No organization selected" description="Select an organization before creating a meter."
          action={<Link to="/organizations" className="btn-primary">Go to organizations</Link>} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Create meter"
        description="Define a new measurement unit for usage-based billing"
        breadcrumbs={[{ label: 'Meters', to: '/meters' }, { label: 'Create meter' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {error && (
          <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{error}</div>
        )}

        <div className="card">
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="key" className="label">Meter key <span className="text-danger">*</span></label>
              <input type="text" id="key" name="key" value={formData.key} onChange={handleKeyChange}
                className="input font-mono" placeholder="api_calls" required autoFocus />
              <p className="text-xs text-muted mt-1">Unique identifier in snake_case (e.g., api_calls, storage_gb)</p>
            </div>

            <div>
              <label htmlFor="meter-name" className="label">Display name <span className="text-danger">*</span></label>
              <input type="text" id="meter-name" name="name" value={formData.name} onChange={handleChange}
                className="input" placeholder="API Calls" required />
            </div>

            <div>
              <label htmlFor="unit" className="label">Unit <span className="text-danger">*</span></label>
              <input type="text" id="unit" name="unit" value={formData.unit} onChange={handleChange}
                className="input" placeholder="requests" required />
              <p className="text-xs text-muted mt-1">Unit of measurement (e.g., requests, GB, minutes)</p>
            </div>

            <div>
              <label htmlFor="aggregation" className="label">Aggregation method <span className="text-danger">*</span></label>
              <select id="aggregation" name="aggregation" value={formData.aggregation} onChange={handleChange} className="select" required>
                {AGGREGATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p className="text-xs text-muted mt-1">
                {AGGREGATION_TYPES.find(t => t.value === formData.aggregation)?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading || !formData.key || !formData.name || !formData.unit}
            className="btn-primary disabled:opacity-50">
            {loading ? 'Creating…' : 'Create meter'}
          </button>
          <Link to="/meters" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </>
  );
}
