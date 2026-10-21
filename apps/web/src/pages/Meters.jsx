import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Meters() {
  const nav = useNavigate();
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) fetchMeters();
    else { setLoading(false); setError('Please select an organization first.'); }
  }, [pagination.offset, organizationId]);

  async function fetchMeters() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const response = await api(`/meters?${params}`);
      if (response.success) {
        const list = response.data?.meters || (Array.isArray(response.data) ? response.data : []);
        setMeters(list);
        setPagination(prev => ({ ...prev, total: response.data?.pagination?.total ?? response.data?.total ?? list.length }));
      } else {
        setError(response.error?.message || 'Failed to load meters');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'slug', header: 'Slug', mono: true, cellClassName: 'cell-muted' },
    { key: 'aggregation', header: 'Aggregation', cellClassName: 'cell-muted' },
    { key: 'eventName', header: 'Event', render: (v, row) => v || row.event || '—', cellClassName: 'cell-muted' },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v !== false ? 'ACTIVE' : 'DISABLED'} /> },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Meters"
        description="Manage usage meters for metered billing"
        action={<Link to="/meters/new" className="btn-primary">Create meter</Link>}
      />

      {error && !loading && (
        <div className="card p-4 mb-4 text-sm text-danger">{error}</div>
      )}

      <div className="card">
        <DataTable
          columns={columns}
          data={meters}
          loading={loading}
          onRowClick={row => nav(`/meters/${row.id}`)}
          emptyState={
            <EmptyState
              icon={Gauge}
              title="No meters yet"
              description="Create meters to track usage events for metered billing."
              action={<Link to="/meters/new" className="btn-primary">Create meter</Link>}
            />
          }
        />
        {!loading && !error && pagination.total > pagination.limit && (
          <TablePagination
            offset={pagination.offset}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={offset => setPagination(prev => ({ ...prev, offset }))}
          />
        )}
      </div>
    </>
  );
}
