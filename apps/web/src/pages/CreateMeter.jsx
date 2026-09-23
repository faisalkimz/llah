import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const AGGREGATION_TYPES = [
  { value: 'SUM', label: 'Sum', description: 'Add up all values (e.g., total API calls)' },
  { value: 'COUNT', label: 'Count', description: 'Count number of events (e.g., transactions)' },
  { value: 'MAX', label: 'Maximum', description: 'Highest value in period (e.g., peak users)' },
  { value: 'LATEST', label: 'Latest', description: 'Most recent value (e.g., current storage)' },
];

export default function CreateMeter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const organizationId = localStorage.getItem('current_organization_id');
  
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    unit: '',
    aggregation: 'SUM',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleKeyChange(e) {
    let value = e.target.value;
    // Auto-format to snake_case
    value = value.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+/, '').replace(/_+/g, '_');
    setFormData((prev) => ({
      ...prev,
      key: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!organizationId) {
      setError('Please select an organization first');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const result = await api('/meters', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select an organization first</p>
          <Link to="/organizations" className="text-black hover:underline">
            Go to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create Meter</h1>
        <p className="text-sm text-gray-600 mt-2">
          Define a new measurement unit for usage-based billing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
              Meter Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="key"
              name="key"
              value={formData.key}
              onChange={handleKeyChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
              placeholder="api_calls"
              required
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier in snake_case (e.g., api_calls, storage_gb, sms_sent)
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="API Calls"
              required
            />
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="requests"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Unit of measurement (e.g., requests, GB, minutes, messages)
            </p>
          </div>

          <div>
            <label htmlFor="aggregation" className="block text-sm font-medium text-gray-700 mb-2">
              Aggregation Method <span className="text-red-500">*</span>
            </label>
            <select
              id="aggregation"
              name="aggregation"
              value={formData.aggregation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            >
              {AGGREGATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {AGGREGATION_TYPES.find(t => t.value === formData.aggregation)?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.key || !formData.name || !formData.unit}
            className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating...' : 'Create Meter'}
          </button>
          <Link
            to="/meters"
            className="px-6 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
