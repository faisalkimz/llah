import { useState, useEffect } from 'react';
import { Code2, Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Drawer from '../components/ui/Drawer.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';

export default function ApiKeys() {
  const { api } = useAuth();
  const toast = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [revealed, setRevealed] = useState({}); // id -> { key, timer }

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

  async function handleCreate(e) {
    e.preventDefault();
    if (!newKeyName.trim()) { setCreateError('Key name is required'); return; }
    try {
      setCreateError('');
      setCreating(true);
      const response = await api('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (response.success) {
        setGeneratedKey(response.data);
        setNewKeyName('');
        setShowCreate(false);
        loadKeys();
      } else {
        setCreateError(response.error?.message || 'Failed to generate key');
      }
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke() {
    if (!revokeConfirm) return;
    try {
      setRevoking(true);
      const response = await api(`/api-keys/${revokeConfirm}`, { method: 'DELETE' });
      if (response.success) {
        toast.success('API key revoked');
        loadKeys();
      } else {
        toast.error(response.error?.message || 'Failed to revoke key');
      }
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setRevoking(false);
      setRevokeConfirm(null);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  }

  function revealKey(id, keyStr) {
    // Clear any existing timer for this key
    if (revealed[id]?.timer) clearTimeout(revealed[id].timer);
    const timer = setTimeout(() => {
      setRevealed(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 30000);
    setRevealed(prev => ({ ...prev, [id]: { key: keyStr, timer } }));
  }

  function hideKey(id) {
    if (revealed[id]?.timer) clearTimeout(revealed[id].timer);
    setRevealed(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const columns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    {
      key: 'prefix',
      header: 'Key',
      render: (v, row) => {
        const isRevealed = !!revealed[row.id];
        return (
          <div className="flex items-center gap-2">
            <code className="font-mono text-xs text-muted">
              {isRevealed ? revealed[row.id].key : `llah_${v || 'live'}_${'•'.repeat(16)}`}
            </code>
            <button
              onClick={e => { e.stopPropagation(); isRevealed ? hideKey(row.id) : revealKey(row.id, `llah_${v || 'live'}_${row.id}`); }}
              className="btn-icon btn-sm"
              aria-label={isRevealed ? 'Hide key' : 'Reveal key'}
            >
              {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            {isRevealed && (
              <button
                onClick={e => { e.stopPropagation(); copyToClipboard(revealed[row.id].key); }}
                className="btn-icon btn-sm"
                aria-label="Copy key"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
    { key: 'lastUsedAt', header: 'Last used', render: v => v ? new Date(v).toLocaleDateString() : 'Never', cellClassName: 'cell-muted' },
    { key: 'status', header: 'Status', render: (v, row) => <StatusBadge status={row.revokedAt || v === 'REVOKED' ? 'REVOKED' : 'ACTIVE'} /> },
    {
      key: 'actions',
      header: '',
      render: (_, row) => !row.revokedAt && row.status !== 'REVOKED' ? (
        <button
          onClick={e => { e.stopPropagation(); setRevokeConfirm(row.id); }}
          className="text-xs text-danger hover:underline"
        >
          Revoke
        </button>
      ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="API keys"
        description="Manage API keys for programmatic access"
        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Generate API key</button>}
      />

      {/* Generated key banner */}
      {generatedKey && (
        <div className="card border-success mb-6">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink mb-1">API key generated</p>
                <p className="text-xs text-muted mb-3">Copy it now — you will not be able to see it again.</p>
                <div className="flex items-center gap-2 bg-canvas-subtle rounded-md border border-line p-3">
                  <code className="flex-1 text-xs font-mono text-ink break-all">{generatedKey.key}</code>
                  <button
                    onClick={() => copyToClipboard(generatedKey.key)}
                    className="btn-secondary btn-sm flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <button onClick={() => setGeneratedKey(null)} className="btn-icon btn-sm" aria-label="Dismiss">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="card bg-info-muted border-info/20 mb-6">
        <div className="card-body text-sm text-info">
          Keep your API keys secure. Never commit them to version control. Use environment variables.
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={keys}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Code2}
              title="No API keys yet"
              description="Generate your first API key for programmatic access."
              action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Generate API key</button>}
            />
          }
        />
      </div>

      <Drawer open={showCreate} onClose={() => { setShowCreate(false); setCreateError(''); }} title="Generate API key">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Key name</label>
            <input
              type="text"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="e.g., Production key"
              className="input"
              autoFocus
            />
          </div>
          {createError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{createError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">{creating ? 'Generating…' : 'Generate key'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!revokeConfirm}
        onClose={() => setRevokeConfirm(null)}
        onConfirm={handleRevoke}
        loading={revoking}
        title="Revoke API key"
        description="Revoke this API key? Any applications using it will stop working. This cannot be undone."
        confirmLabel="Revoke key"
        confirmVariant="btn-danger"
      />
    </>
  );
}
