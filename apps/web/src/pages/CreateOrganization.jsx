import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function CreateOrganization() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleNameChange(e) {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: autoSlug ? generateSlug(name) : prev.slug,
    }));
  }

  function generateSlug(name) {
    return name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 63);
  }

  function handleSlugChange(e) {
    setAutoSlug(false);
    setFormData(prev => ({ ...prev, slug: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { name: formData.name };
      if (!autoSlug && formData.slug) payload.slug = formData.slug;
      const result = await api('/organizations', { method: 'POST', body: JSON.stringify(payload) });
      if (result.success) {
        navigate(`/organizations/${result.data.organization?.id || result.data.id}`);
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
    <>
      <PageHeader title="Create organization" description="Organizations help you manage teams and billing" />

      <div className="card max-w-lg">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{error}</div>
            )}

            <div>
              <label htmlFor="org-name" className="label">Organization name</label>
              <input
                type="text"
                id="org-name"
                value={formData.name}
                onChange={handleNameChange}
                className="input"
                placeholder="Acme Inc."
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="org-slug" className="label">URL slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">/</span>
                <input
                  type="text"
                  id="org-slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  className="input flex-1 font-mono"
                  placeholder="acme-inc"
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="text-xs text-muted mt-1">
                {autoSlug ? 'Auto-generated from name' : 'Lowercase letters, numbers, and hyphens only'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading || !formData.name} className="btn-primary disabled:opacity-50">
                {loading ? 'Creating…' : 'Create organization'}
              </button>
              <button type="button" onClick={() => navigate('/organizations')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
