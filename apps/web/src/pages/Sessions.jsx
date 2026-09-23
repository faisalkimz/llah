import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { useNavigate } from 'react-router-dom';

export default function Sessions() {
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const data = await api('/auth/sessions');
      setSessions(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function revokeSession(sessionId) {
    setRevoking(sessionId);
    try {
      await api(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (e) {
      setError(e.message);
    } finally {
      setRevoking(null);
    }
  }

  async function logoutAll() {
    if (!confirm('This will log you out of all devices. Continue?')) return;

    try {
      await Promise.all(sessions.map(s => api(`/auth/sessions/${s.id}`, { method: 'DELETE' })));
      localStorage.removeItem('llah_access_token');
      localStorage.removeItem('llah_refresh_token');
      nav('/login');
    } catch (e) {
      setError(e.message);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink">Active Sessions</h1>
          <p className="mt-1 text-sm text-muted">Loading your sessions...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/20 border-t-ink"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Active Sessions</h1>
          <p className="mt-1 text-sm text-muted">
            Manage devices where you're currently logged in
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={logoutAll}
            className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2 text-sm font-medium text-danger transition-all hover:bg-danger/10 hover:border-danger/50"
          >
            Revoke all sessions
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="rounded-lg border border-line bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm text-muted">No active sessions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div 
              key={session.id} 
              className="rounded-lg border border-line bg-white p-5 shadow-sm transition-all hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/5">
                      <svg className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink">
                          {index === 0 ? 'This device' : `Session ${index + 1}`}
                        </p>
                        {index === 0 && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                        <span>Created {formatDate(session.createdAt)}</span>
                        <span>•</span>
                        <span>Expires {formatDate(session.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => revokeSession(session.id)}
                  disabled={revoking === session.id}
                  className="ml-4 rounded-lg px-3 py-1.5 text-sm font-medium text-danger transition-all hover:bg-danger/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revoking === session.id ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 rounded-lg border border-line bg-white p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted">
              Sessions represent devices where you're currently signed in. 
              Revoking a session will immediately log out that device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
