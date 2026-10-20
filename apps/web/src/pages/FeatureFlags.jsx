import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function FeatureFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Flag form state
  const [newKey, setNewKey] = useState('');
  const [newEnabled, setNewEnabled] = useState(false);
  const [addError, setAddError] = useState(null);
  const [adding, setAdding] = useState(false);

  // Per-flag toggling / deleting state
  const [togglingKey, setTogglingKey] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    setLoading(true);
    setError(null);
    const response = await api('/feature-flags');
    if (response.success) {
      setFlags(response.data || []);
    } else {
      setError(response.error?.message || 'Failed to load feature flags');
    }
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const key = newKey.trim();
    if (!key) {
      setAddError('Flag key is required.');
      return;
    }

    setAdding(true);
    setAddError(null);

    const response = await api(`/feature-flags/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ key, enabled: newEnabled }),
    });

    if (response.success) {
      setNewKey('');
      setNewEnabled(false);
      await fetchFlags();
    } else {
      setAddError(response.error?.message || 'Failed to add feature flag');
    }

    setAdding(false);
  };

  const handleToggle = async (flag) => {
    setTogglingKey(flag.key);

    const response = await api(`/feature-flags/${encodeURIComponent(flag.key)}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled: !flag.enabled }),
    });

    if (response.success) {
      setFlags((prev) =>
        prev.map((f) =>
          f.key === flag.key ? { ...f, enabled: !f.enabled } : f
        )
      );
    }
    // Silently fail on toggle error — state reverts naturally since we didn't update
    setTogglingKey(null);
  };

  const handleDelete = async (flag) => {
    if (
      !window.confirm(
        `Delete feature flag "${flag.key}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingKey(flag.key);

    const response = await api(`/feature-flags/${encodeURIComponent(flag.key)}`, {
      method: 'DELETE',
    });

    if (response.success) {
      setFlags((prev) => prev.filter((f) => f.key !== flag.key));
    }
    setDeletingKey(null);
  };

  return (
    <>
      <PageHeader
        title="Feature Flags"
        description="Platform feature flag management"
      />

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 mb-6 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm">
        <span className="text-amber-500 mt-0.5" aria-hidden="true">⚠</span>
        <span>
          Feature flags are platform-wide settings. Changes affect all
          organizations.
        </span>
      </div>

      {/* Add Flag Form */}
      <div className="llah-card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Add Flag</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="flag-key"
              className="text-xs text-muted-foreground"
            >
              Key
            </label>
            <input
              id="flag-key"
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g. new_billing_flow"
              className="input w-64"
              disabled={adding}
            />
          </div>
          <div className="flex items-center gap-2 pb-1">
            <input
              id="flag-enabled"
              type="checkbox"
              checked={newEnabled}
              onChange={(e) => setNewEnabled(e.target.checked)}
              disabled={adding}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="flag-enabled"
              className="text-sm text-muted-foreground select-none"
            >
              Enabled
            </label>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding...' : 'Add Flag'}
          </button>
        </form>
        {addError && (
          <p className="mt-2 text-sm text-destructive">{addError}</p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="llah-card p-8 text-center text-muted">
          Loading feature flags...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="llah-card p-8 text-center">
          <div className="text-destructive mb-2">Error: {error}</div>
          <button onClick={fetchFlags} className="btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && flags.length === 0 && (
        <div className="llah-card p-8 text-center text-muted">
          No feature flags configured.
        </div>
      )}

      {/* Flags List */}
      {!loading && !error && flags.length > 0 && (
        <div className="space-y-2">
          {flags.map((flag) => (
            <div
              key={flag.key}
              className="llah-card flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-medium text-sm truncate">{flag.key}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    flag.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Toggle */}
                <label
                  className="relative inline-flex items-center cursor-pointer"
                  aria-label={`Toggle ${flag.key}`}
                >
                  <input
                    type="checkbox"
                    checked={flag.enabled}
                    onChange={() => handleToggle(flag)}
                    disabled={togglingKey === flag.key}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(flag)}
                  disabled={deletingKey === flag.key}
                  className="text-sm text-destructive hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingKey === flag.key ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
