import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const AGGREGATION_TYPES = [
  { value: 'SUM', label: 'Sum' },
  { value: 'COUNT', label: 'Count' },
  { value: 'MAX', label: 'Maximum' },
  { value: 'LATEST', label: 'Latest' },
];

export default function MeterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meter, setMeter] = useState(null);
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
      loadMeter();
    }
  }, [organizationId, id]);

  async function loadMeter() {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api(`/meters/${id}`);
      
      if (result.success) {
        const data = result.data;
        setMeter(data);
        setFormData({
          name: data.name || '',
          unit: data.unit || '',
          aggregation: data.aggregation || 'SUM',
        });
      } else {
        setError(result.error?.message || 'Failed to load meter');
      }
    } catch (err) {
      setError(err.message || 'Failed to load meter');
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
      const payload = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== meter[key]) {
          payload[key] = value;
        }
      });

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }

      const result = await api(`/meters/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (result.success) {
        setMeter(result.data);
        setEditing(false);
      } else {
        setSaveError(result.error?.message || 'Failed to update meter');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update meter');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditing(false);
    setSaveError(null);
    setFormData({
      name: meter.name || '',
      unit: meter.unit || '',
      aggregation: meter.aggregation || 'SUM',
    });
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete the meter "${meter.name}"?\n\nThis action cannot be undone and will fail if the meter has existing usage events or is used in pricing.`
    );
    
    if (!confirmed) return;

    setDeleting(true);
    
    try {
      const result = await api(`/meters/${id}`, {
        method: 'DELETE',
      });

      if (result.success) {
        navigate('/meters');
      } else {
        alert(result.error?.message || 'Failed to delete meter');
        setDeleting(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete meter');
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
        <div className="text-center text-gray-500">Loading meter...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link to="/meters" className="text-black hover:underline">
            Back to Meters
          </Link>
        </div>
      </div>
    );
  }

  if (!meter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Meter not found</div>
          <Link to="/meters" className="text-black hover:underline">
            Back to Meters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link to="/meters" className="hover:text-gray-900">
            Meters
          </Link>
          <span>/</span>
          <span className="text-gray-900">{meter.key}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{meter.name}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">{meter.key}</p>
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

      {meter._count && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {meter._count.usageEvents || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Usage Events</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {meter._count.prices || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Prices</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {saveError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {saveError}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Meter Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meter Key
            </label>
            <div className="text-gray-900 font-mono text-sm bg-gray-50 px-4 py-2 rounded border border-gray-200">
              {meter.key}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Key cannot be changed to maintain data integrity
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
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
              <div className="text-gray-900">{meter.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            {editing ? (
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            ) : (
              <div className="text-gray-900">{meter.unit}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aggregation Method
            </label>
            {editing ? (
              <select
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
            ) : (
              <div className="text-gray-900">{meter.aggregation}</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Metadata</h2>
          <div className="text-sm">
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 text-gray-900">
              {new Date(meter.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {editing && (
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
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
