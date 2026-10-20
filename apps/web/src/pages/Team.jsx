import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const ROLES = ['VIEWER', 'ANALYST', 'DEVELOPER', 'BILLING', 'ADMIN'];

const ROLE_BADGE = {
  ADMIN:     'bg-red-100 text-red-700',
  OWNER:     'bg-purple-100 text-purple-700',
  DEVELOPER: 'bg-blue-100 text-blue-700',
  BILLING:   'bg-yellow-100 text-yellow-700',
  ANALYST:   'bg-green-100 text-green-700',
  VIEWER:    'bg-gray-100 text-gray-700',
};

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
}

export default function Team() {
  const orgId = localStorage.getItem('current_organization_id');

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [inviteError, setInviteError] = useState('');
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    if (orgId) loadMembers();
    else setLoading(false);
  }, [orgId]);

  async function loadMembers() {
    try {
      setLoading(true);
      setError(null);
      const res = await api(`/organizations/${orgId}/members`);
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data : (res.data?.members || []);
        setMembers(raw);
      } else {
        setError(res.error?.message || 'Failed to load team members');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }
    try {
      setInviteSaving(true);
      setInviteError('');
      const res = await api(`/organizations/${orgId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.success) {
        setInviteEmail('');
        setInviteRole('VIEWER');
        setShowInvite(false);
        setInviteSuccess('Invitation sent successfully');
        setTimeout(() => setInviteSuccess(''), 3000);
        loadMembers();
      } else {
        setInviteError(res.error?.message || 'Failed to send invitation');
      }
    } catch (e) {
      setInviteError(e.message || 'An error occurred');
    } finally {
      setInviteSaving(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const res = await api(`/organizations/${orgId}/members/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.success) {
        setMembers(prev =>
          prev.map(m => (m.userId === userId || m.user?.id === userId ? { ...m, role: newRole } : m))
        );
      } else {
        alert(res.error?.message || 'Failed to update role');
      }
    } catch (e) {
      alert(e.message || 'An error occurred');
    }
  }

  async function handleRemove(userId, displayName) {
    if (!confirm(`Remove ${displayName} from this organization?`)) return;
    try {
      const res = await api(`/organizations/${orgId}/members/${userId}`, { method: 'DELETE' });
      if (res.success) {
        loadMembers();
      } else {
        alert(res.error?.message || 'Failed to remove member');
      }
    } catch (e) {
      alert(e.message || 'An error occurred');
    }
  }

  // No org selected
  if (!orgId) {
    return (
      <>
        <PageHeader title="Team" description="Manage organization members" />
        <div className="llah-card p-12 text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-lg font-semibold text-ink mb-2">No organization selected</h2>
          <p className="text-muted text-sm">Please select an organization to manage team members.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage organization members"
        action={{
          label: showInvite ? 'Cancel' : '+ Invite Member',
          onClick: () => { setShowInvite(v => !v); setInviteError(''); },
        }}
      />

      {inviteSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          {inviteSuccess}
        </div>
      )}

      {/* Invite form */}
      {showInvite && (
        <div className="llah-card p-6 mb-6">
          <h3 className="font-semibold text-ink mb-4">Invite New Member</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {inviteError && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
                {inviteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={inviteSaving}
                className="px-4 py-2 bg-ink text-white text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {inviteSaving ? 'Sending…' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => { setShowInvite(false); setInviteError(''); }}
                className="px-4 py-2 border border-line rounded-lg text-sm hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
          <button onClick={loadMembers} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Members table */}
      <div className="llah-card">
        <div className="overflow-x-auto">
          <table className="llah-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">Loading members…</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">
                    No members yet.{' '}
                    <button onClick={() => setShowInvite(true)} className="text-ink underline">Invite someone</button>
                  </td>
                </tr>
              ) : (
                members.map(member => {
                  const user = member.user || {};
                  const userId = user.id || member.userId;
                  const displayName = user.name || user.email || userId || '—';
                  const email = user.email || member.email || '—';
                  const isOwner = member.role === 'OWNER';

                  return (
                    <tr key={member.id || userId}>
                      <td className="font-medium">{displayName}</td>
                      <td className="text-sm text-muted">{email}</td>
                      <td>
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="text-sm text-muted">
                        {member.createdAt || member.joinedAt
                          ? new Date(member.createdAt || member.joinedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {!isOwner ? (
                            <select
                              value={member.role}
                              onChange={e => handleRoleChange(userId, e.target.value)}
                              className="px-2 py-1 text-xs border border-line rounded focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10"
                            >
                              {ROLES.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-muted">Owner</span>
                          )}
                          {!isOwner && (
                            <button
                              onClick={() => handleRemove(userId, displayName)}
                              className="text-xs text-danger hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
