import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function CreateOrganization() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleNameChange(e) {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? generateSlug(name) : prev.slug,
    }));
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 63);
  }

  function handleSlugChange(e) {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { name: formData.name };
      if (!autoSlug && formData.slug) {
        payload.slug = formData.slug;
      }

      const result = await api('/organizations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (result.success) {
        navigate(`/organizations/${result.data.organization.id}`);
      } else {
        setError(result.error?.message || 'Failed to create organization');
      }
    } catch (err) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create Organization</h1>
        <p className="text-sm text-gray-600 mt-2">
          Organizations help you manage teams and projects
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Acme Inc."
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">/</span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="acme-inc"
              pattern="[a-z0-9-]+"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {autoSlug ? 'Auto-generated from name' : 'Lowercase letters, numbers, and hyphens only'}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.name}
            className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/organizations')}
            className="px-6 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
