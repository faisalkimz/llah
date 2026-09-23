import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OrganizationSettings() {
  const { id } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const roles = ['OWNER', 'ADMIN', 'BILLING', 'DEVELOPER', 'ANALYST', 'VIEWER'];

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [orgResult, membersResult] = await Promise.all([
        api(`/organizations/${id}`),
        api(`/organizations/${id}/members`),
      ]);
      
      if (orgResult.success && membersResult.success) {
        setOrganization(orgResult.data);
        setMembers(membersResult.data);
        setFormData({ name: orgResult.data.name, slug: orgResult.data.slug });
        setError(null);
      } else {
        setError(orgResult.error?.message || membersResult.error?.message || 'Failed to load organization');
      }
    } catch (err) {
      setError(err.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOrg(e) {
    e.preventDefault();
    try {
      const result = await api(`/organizations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      
      if (result.success) {
        setOrganization(result.data);
        setSuccess('Organization updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error?.message || 'Failed to update organization');
      }
    } catch (err) {
      setError(err.message || 'Failed to update organization');
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    try {
      const result = await api(`/organizations/${id}/members`, {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        })
      });
      
      if (result.success) {
        setInviteEmail('');
        setInviteRole('VIEWER');
        setSuccess('Member invited successfully');
        setTimeout(() => setSuccess(null), 3000);
        loadData();
      } else {
        setError(result.error?.message || 'Failed to invite member');
      }
    } catch (err) {
      setError(err.message || 'Failed to invite member');
    }
  }

  async function handleUpdateRole(membershipId, newRole) {
    try {
      const result = await api(`/organizations/memberships/${membershipId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      
      if (result.success) {
        setSuccess('Role updated successfully');
        setTimeout(() => setSuccess(null), 3000);
        loadData();
      } else {
        setError(result.error?.message || 'Failed to update role');
      }
    } catch (err) {
      setError(err.message || 'Failed to update role');
    }
  }

  async function handleRemoveMember(membershipId) {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const result = await api(`/organizations/memberships/${membershipId}`, {
        method: 'DELETE'
      });
      
      if (result.success) {
        setSuccess('Member removed successfully');
        setTimeout(() => setSuccess(null), 3000);
        loadData();
      } else {
        setError(result.error?.message || 'Failed to remove member');
      }
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center text-red-600">Organization not found</div>
      </div>
    );
  }

  const canManage = ['OWNER', 'ADMIN'].includes(organization.role);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{organization.name}</h1>
        <p className="text-sm text-gray-500 mt-1">/{organization.slug}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'general'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'members'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Team Members
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          {success}
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white border border-gray-200 rounded p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Organization Settings</h2>
          {canManage ? (
            <form onSubmit={handleUpdateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              Only owners and admins can modify organization settings.
            </p>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite Form */}
          {canManage && (
            <div className="bg-white border border-gray-200 rounded p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Invite Member</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition"
                  >
                    Invite
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members List */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Members</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {canManage ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {member.role}
                      </span>
                    )}
                    {canManage && member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
