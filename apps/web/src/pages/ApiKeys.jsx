import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function ApiKeys() {
  const { api } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState({ name: '' });
  const [generatedKey, setGeneratedKey] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      setLoading(true);
      const response = await api('/api-keys');
      if (response.success) {
        setKeys(Array.isArray(response.data) ? response.data : []);
      }
    } catch (e) {
      console.error('Failed to load API keys:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKey.name.trim()) {
      setError('API key name is required');
      return;
    }

    try {
      setError('');
      const response = await api('/api-keys', {
        method: 'POST',
        body: JSON.stringify(newKey)
      });

      if (response.success) {
        setGeneratedKey(response.data);
        setNewKey({ name: '' });
        setShowCreate(false);
        loadKeys();
      } else {
        setError(response.error.message);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function revokeKey(keyId) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api(`/api-keys/${keyId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        loadKeys();
      }
    } catch (e) {
      console.error('Failed to revoke key:', e);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  return (
    <>
      <PageHeader 
        title="API Keys" 
        description="Manage API keys for programmatic access"
        action={{
          label: '+ Generate API Key',
          onClick: () => setShowCreate(true)
        }}
      />

      {/* Generated Key Alert */}
      {generatedKey && (
        <div className="llah-card p-6 mb-6 border-2 border-success bg-success/5">
          <div className="flex items-start gap-3 mb-4">
            <svg className="h-6 w-6 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-ink mb-1">API Key Generated Successfully!</h3>
              <p className="text-sm text-muted mb-3">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
              <div className="flex items-center gap-2 bg-white rounded-lg border p-3">
                <code className="flex-1 text-sm font-mono text-ink break-all">
                  {generatedKey.key}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedKey.key)}
                  className="px-3 py-1.5 text-sm font-medium text-ink bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setGeneratedKey(null)}
              className="text-muted hover:text-ink transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Generate New API Key</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Name
              </label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                placeholder="e.g., Production Key, Development Key"
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={createKey}
                className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors"
              >
                Generate Key
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setError('');
                  setNewKey({ name: '' });
                }}
                className="px-4 py-2 border border-line rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="llah-card">
        <div className="overflow-x-auto">
          <table className="llah-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    Loading API keys...
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-muted mb-2">No API keys yet</div>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="text-sm text-ink hover:underline"
                    >
                      Generate your first API key
                    </button>
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id}>
                    <td className="font-medium">{key.name}</td>
                    <td>
                      <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                        llah_{key.prefix}_...
                      </code>
                    </td>
                    <td className="text-muted">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-muted">
                      {key.lastUsedAt 
                        ? new Date(key.lastUsedAt).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td>
                      {key.status !== 'ACTIVE' || key.revokedAt ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-danger bg-danger/10 px-2 py-1 rounded">
                          <span className="h-1.5 w-1.5 rounded-full bg-danger"></span>
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
                          <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      {key.status === 'ACTIVE' && !key.revokedAt && (
                        <button
                          onClick={() => revokeKey(key.id)}
                          className="text-sm text-danger hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">API Key Security</h4>
            <p className="text-sm text-blue-800">
              Keep your API keys secure. Never share them or commit them to version control.
              Use environment variables to store keys in your applications.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
