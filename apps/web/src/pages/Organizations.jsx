import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Organizations() {
  const { api } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadOrganizations(); }, []);

  async function loadOrganizations() {
    try {
      setLoading(true);
      const result = await api('/organizations');
      if (result.success) {
        const list = result.data?.organizations || (Array.isArray(result.data) ? result.data : []);
        setOrganizations(list);
        setError(null);
        if (list.length > 0 && !localStorage.getItem('current_organization_id')) {
          localStorage.setItem('current_organization_id', list[0].id);
        }
      } else {
        setError(result.error?.message || 'Failed to load organizations');
      }
    } catch (err) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }

  function selectOrganization(orgId) {
    localStorage.setItem('current_organization_id', orgId);
    nav('/dashboard');
  }

  const columns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'slug', header: 'Slug', mono: true, render: v => v ? `/${v}` : '—', cellClassName: 'cell-muted' },
    { key: 'role', header: 'Role', render: v => v ? <span className="badge badge-neutral">{v}</span> : '—' },
    { key: 'memberCount', header: 'Members', render: (v, row) => <span className="tabular-nums">{v ?? row._count?.members ?? '—'}</span> },
    { key: 'createdAt', header: 'Created', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Switch between organizations or create a new one"
        action={<Link to="/organizations/new" className="btn-primary">Create organization</Link>}
      />

      {error && (
        <div className="card p-4 mb-4 text-sm text-danger">{error}</div>
      )}

      <div className="card">
        <DataTable
          columns={columns}
          data={organizations}
          loading={loading}
          onRowClick={row => selectOrganization(row.id)}
          emptyState={
            <EmptyState
              icon={Building2}
              title="No organizations yet"
              description="Create your first organization to start using Llah."
              action={<Link to="/organizations/new" className="btn-primary">Create organization</Link>}
            />
          }
        />
      </div>
    </>
  );
}
