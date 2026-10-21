import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

const TABS = ['General', 'Members', 'Danger zone'];

export default function OrganizationSettings() {
  const { id } = useParams();
  const { api } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [orgResult, membersResult] = await Promise.all([
        api(`/organizations/${id}`),
        api(`/organizations/${id}/members`),
      ]);
      if (orgResult.success) {
        setOrganization(orgResult.data);
        setFormData({ name: orgResult.data.name, slug: orgResult.data.slug });
      } else {
        setError(orgResult.error?.message || 'Failed to load organization');
      }
      if (membersResult.success) {
        setMembers(Array.isArray(membersResult.data) ? membersResult.data : (membersResult.data?.members || []));
      }
    } catch (err) {
      setError(err.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await api(`/organizations/${id}`, { method: 'PATCH', body: JSON.stringify(formData) });
      if (result.success) {
        setOrganization(result.data);
        toast.success('Organization updated');
      } else {
        toast.error(result.error?.message || 'Failed to update organization');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteInput !== organization?.name) { toast.error('Organization name does not match'); return; }
    try {
      setDeleting(true);
      const result = await api(`/organizations/${id}`, { method: 'DELETE' });
      if (result.success) {
        localStorage.removeItem('current_organization_id');
        toast.success('Organization deleted');
        nav('/organizations');
      } else {
        toast.error(result.error?.message || 'Failed to delete organization');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete organization');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Organization settings" />
        <div className="grid grid-cols-1 gap-4">{[0,1].map(i=><SkeletonCard key={i}/>)}</div>
      </>
    );
  }

  if (error || !organization) {
    return (
      <>
        <PageHeader title="Organization settings" />
        <div className="card p-8 text-center text-danger">{error || 'Organization not found'}</div>
      </>
    );
  }

  const canManage = ['OWNER', 'ADMIN'].includes(organization.role);

  return (
    <>
      <PageHeader
        title={organization.name}
        description={`/${organization.slug}`}
        breadcrumbs={[{ label: 'Organizations', to: '/organizations' }, { label: organization.name }]}
      />

      <div className="tab-list mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab ${activeTab === tab ? 'tab-active' : ''}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'General' && (
        <div className="card">
          <div className="card-header"><h2 className="text-sm font-semibold text-ink">Organization details</h2></div>
          <div className="card-body">
            {canManage ? (
              <form onSubmit={handleSave} className="space-y-4 max-w-sm">
                <div>
                  <label className="label">Organization name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="label">URL slug</label>
                  <input type="text" value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} className="input font-mono" pattern="[a-z0-9-]+" required />
                </div>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
              </form>
            ) : (
              <p className="text-sm text-muted">Only owners and admins can modify organization settings.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Members' && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Team members ({members.length})</h2>
            <Link to="/team" className="text-sm text-accent hover:underline">Manage in Team page</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const user = m.user || {};
                  return (
                    <tr key={m.id}>
                      <td className="font-medium">{user.name || user.email?.split('@')[0] || '—'}</td>
                      <td className="cell-muted">{user.email || '—'}</td>
                      <td><span className="badge badge-neutral">{m.role}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Danger zone' && (
        <div className="card border-danger/30">
          <div className="card-header border-danger/20">
            <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
          </div>
          <div className="card-body">
            <p className="text-sm text-muted mb-4">
              Deleting this organization will permanently remove all associated data. This action cannot be undone.
            </p>
            <button onClick={() => setDeleteConfirm(true)} className="btn-danger">Delete organization</button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteConfirm}
        onClose={() => { setDeleteConfirm(false); setDeleteInput(''); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete organization"
        description=""
        confirmLabel="Delete permanently"
        confirmVariant="btn-danger"
      >
        <div className="space-y-3 -mt-2">
          <p className="text-sm text-muted">
            Type <span className="font-semibold text-ink">{organization.name}</span> to confirm deletion.
          </p>
          <input
            type="text"
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
            placeholder={organization.name}
            className="input"
            autoFocus
          />
        </div>
      </ConfirmModal>
    </>
  );
}
