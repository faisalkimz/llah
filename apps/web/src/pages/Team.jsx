import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Drawer from '../components/ui/Drawer.jsx';

const ROLES = ['VIEWER', 'ANALYST', 'DEVELOPER', 'BILLING', 'ADMIN'];

const ROLE_VARIANT = {
  ADMIN: 'badge-danger',
  OWNER: 'badge-warning',
  DEVELOPER: 'badge-info',
  BILLING: 'badge-success',
  ANALYST: 'badge-success',
  VIEWER: 'badge-neutral',
};

function RoleBadge({ role }) {
  return <span className={`badge ${ROLE_VARIANT[role] || 'badge-neutral'}`}>{role}</span>;
}

export default function Team() {
  const toast = useToast();
  const orgId = localStorage.getItem('current_organization_id');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [inviteError, setInviteError] = useState('');
  const [inviteSaving, setInviteSaving] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [removing, setRemoving] = useState(false);

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
        setMembers(Array.isArray(res.data) ? res.data : (res.data?.members || []));
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
    if (!inviteEmail.trim()) { setInviteError('Email is required'); return; }
    try {
      setInviteSaving(true);
      setInviteError('');
      const res = await api(`/organizations/${orgId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.success) {
        setInviteEmail(''); setInviteRole('VIEWER');
        setShowInvite(false);
        toast.success('Invitation sent');
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
        setMembers(prev => prev.map(m => (m.userId === userId || m.user?.id === userId ? { ...m, role: newRole } : m)));
        toast.success('Role updated');
      } else {
        toast.error(res.error?.message || 'Failed to update role');
      }
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    }
  }

  async function handleRemove() {
    if (!removeConfirm) return;
    try {
      setRemoving(true);
      const res = await api(`/organizations/${orgId}/members/${removeConfirm.userId}`, { method: 'DELETE' });
      if (res.success) {
        toast.success(`${removeConfirm.displayName} removed`);
        loadMembers();
      } else {
        toast.error(res.error?.message || 'Failed to remove member');
      }
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setRemoving(false);
      setRemoveConfirm(null);
    }
  }

  if (!orgId) {
    return (
      <>
        <PageHeader title="Team" description="Manage organization members" />
        <EmptyState icon={Users} title="No organization selected" description="Select an organization to manage team members." />
      </>
    );
  }

  const columns = [
    { key: 'name', header: 'Name', render: (_, row) => {
      const user = row.user || {};
      return <span className="font-medium text-ink">{user.name || user.email?.split('@')[0] || '—'}</span>;
    }},
    { key: 'email', header: 'Email', render: (_, row) => {
      const user = row.user || {};
      return <span className="cell-muted">{user.email || row.email || '—'}</span>;
    }},
    { key: 'role', header: 'Role', render: v => <RoleBadge role={v} /> },
    { key: 'createdAt', header: 'Joined', render: (v, row) => {
      const d = v || row.joinedAt;
      return d ? new Date(d).toLocaleDateString() : '—';
    }, cellClassName: 'cell-muted' },
    {
      key: 'actions', header: '',
      render: (_, row) => {
        const user = row.user || {};
        const userId = user.id || row.userId;
        const displayName = user.name || user.email || '—';
        const isOwner = row.role === 'OWNER';
        if (isOwner) return <span className="text-xs text-muted">Owner</span>;
        return (
          <div className="flex items-center gap-3">
            <select
              value={row.role}
              onChange={e => handleRoleChange(userId, e.target.value)}
              className="select text-xs"
              style={{ height: 30, padding: '0 28px 0 8px', width: 110 }}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              onClick={e => { e.stopPropagation(); setRemoveConfirm({ userId, displayName }); }}
              className="text-xs text-danger hover:underline"
            >
              Remove
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage organization members"
        action={<button className="btn-primary" onClick={() => setShowInvite(true)}>Invite member</button>}
      />

      {error && (
        <div className="card p-4 mb-4 border-danger/30 text-sm text-danger">
          {error} <button onClick={loadMembers} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="card">
        <DataTable
          columns={columns}
          data={members}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Users}
              title="No members yet"
              description="Invite team members to collaborate."
              action={<button className="btn-primary" onClick={() => setShowInvite(true)}>Invite member</button>}
            />
          }
        />
      </div>

      <Drawer open={showInvite} onClose={() => { setShowInvite(false); setInviteError(''); }} title="Invite team member">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="member@example.com" className="input" autoFocus required />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="select">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {inviteError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{inviteError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={inviteSaving} className="btn-primary disabled:opacity-50">{inviteSaving ? 'Sending…' : 'Send invitation'}</button>
            <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={handleRemove}
        loading={removing}
        title="Remove member"
        description={`Remove ${removeConfirm?.displayName} from this organization?`}
        confirmLabel="Remove member"
        confirmVariant="btn-danger"
      />
    </>
  );
}
