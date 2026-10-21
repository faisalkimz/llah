import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 7) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default function Sessions() {
  const nav = useNavigate();
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState(null);
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [revokeAllConfirm, setRevokeAllConfirm] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      const data = await api('/auth/sessions');
      setSessions(Array.isArray(data) ? data : (data?.sessions || []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (!revokeConfirm) return;
    setRevoking(revokeConfirm);
    try {
      await api(`/auth/sessions/${revokeConfirm}`, { method: 'DELETE' });
      setSessions(s => s.filter(sess => sess.id !== revokeConfirm));
      toast.success('Session revoked');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRevoking(null);
      setRevokeConfirm(null);
    }
  }

  async function handleRevokeAll() {
    setRevokingAll(true);
    try {
      await Promise.all(sessions.map(s => api(`/auth/sessions/${s.id}`, { method: 'DELETE' })));
      localStorage.removeItem('llah_access_token');
      localStorage.removeItem('llah_refresh_token');
      nav('/login');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRevokingAll(false);
      setRevokeAllConfirm(false);
    }
  }

  const columns = [
    {
      key: 'index', header: 'Session',
      render: (_, row, idx) => (
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted flex-shrink-0" strokeWidth={1.5} />
          <span className="font-medium text-ink">{row.device || row.userAgent?.slice(0, 40) || `Session ${idx + 1}`}</span>
        </div>
      ),
    },
    { key: 'ipAddress', header: 'IP', mono: true, render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'createdAt', header: 'Created', render: v => v ? formatDate(v) : '—', cellClassName: 'cell-muted' },
    { key: 'expiresAt', header: 'Expires', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'actions', header: '',
      render: (_, row) => (
        <button
          onClick={e => { e.stopPropagation(); setRevokeConfirm(row.id); }}
          disabled={revoking === row.id}
          className="text-xs text-danger hover:underline disabled:opacity-50"
        >
          {revoking === row.id ? 'Revoking…' : 'Revoke'}
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Active sessions"
        description="Manage devices where you are currently signed in"
        action={
          sessions.length > 1 ? (
            <button onClick={() => setRevokeAllConfirm(true)} className="btn-danger">Revoke all sessions</button>
          ) : null
        }
      />

      {error && <div className="card p-4 mb-4 text-sm text-danger">{error}</div>}

      <div className="card">
        <DataTable
          columns={columns}
          data={sessions}
          loading={loading}
          emptyState={<EmptyState icon={Monitor} title="No active sessions" description="Your active sessions will appear here." />}
        />
      </div>

      <ConfirmModal
        open={!!revokeConfirm}
        onClose={() => setRevokeConfirm(null)}
        onConfirm={handleRevoke}
        loading={revoking === revokeConfirm}
        title="Revoke session"
        description="Revoke this session? The device will be signed out immediately."
        confirmLabel="Revoke session"
        confirmVariant="btn-danger"
      />

      <ConfirmModal
        open={revokeAllConfirm}
        onClose={() => setRevokeAllConfirm(false)}
        onConfirm={handleRevokeAll}
        loading={revokingAll}
        title="Revoke all sessions"
        description="This will sign you out of all devices, including this one."
        confirmLabel="Revoke all"
        confirmVariant="btn-danger"
      />
    </>
  );
}
