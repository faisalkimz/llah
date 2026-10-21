import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Customers() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) {
      fetchCustomers();
    } else {
      setLoading(false);
      setError('Please select an organization first.');
    }
  }, [search, pagination.offset, organizationId]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      if (search) params.append('search', search);
      const response = await api(`/customers?${params}`);
      if (response.success) {
        setCustomers(response.data.customers || []);
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
      } else {
        setError(response.error?.message || 'Failed to load customers');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    const rows = [
      ['Name', 'Email', 'Phone', 'External ID', 'Created'],
      ...customers.map(c => [
        c.name, c.email || '', c.phone || '', c.externalId || '',
        new Date(c.createdAt).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (v, row) => (
        <span className="font-medium text-ink">{v}</span>
      ),
    },
    { key: 'email', header: 'Email', render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'phone', header: 'Phone', render: v => v || '—', cellClassName: 'cell-muted' },
    { key: 'externalId', header: 'External ID', mono: true, render: v => v || '—' },
    {
      key: 'createdAt',
      header: 'Created',
      render: v => new Date(v).toLocaleDateString(),
      cellClassName: 'cell-muted',
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your customers and their information"
        action={
          <div className="flex gap-2">
            <button onClick={handleExportCsv} className="btn-secondary" disabled={customers.length === 0}>
              Export CSV
            </button>
            <Link to="/customers/new" className="btn-primary">New customer</Link>
          </div>
        }
      />

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPagination(prev => ({ ...prev, offset: 0 }));
            }}
            className="input max-w-sm"
          />
        </div>

        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={fetchCustomers} className="btn-secondary">Retry</button>
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={customers}
            loading={loading}
            onRowClick={row => nav(`/customers/${row.id}`)}
            emptyState={
              <EmptyState
                icon={Users}
                title="No customers yet"
                description="Add your first customer to get started."
                action={<Link to="/customers/new" className="btn-primary">New customer</Link>}
              />
            }
          />
        )}

        {!loading && !error && pagination.total > 0 && (
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
