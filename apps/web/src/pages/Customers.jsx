import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
  });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (organizationId) {
      fetchCustomers();
    } else {
      setLoading(false);
      setError('Please select an organization first');
    }
  }, [search, pagination.offset, organizationId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await api(`/customers?${params.toString()}`);
      
      if (response.success) {
        setCustomers(response.data.customers || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
        }));
      } else {
        setError(response.error?.message || 'Failed to load customers');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page on search
  };

  const handleNextPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const handlePrevPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your customers and their information"
        action={
          <Link
            to="/customers/new"
            className="btn-primary"
          >
            + New Customer
          </Link>
        }
      />

      <div className="llah-card">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="input w-full max-w-md"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center text-muted">
            Loading customers...
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-destructive mb-2">Error: {error}</div>
            {error.includes('organization') ? (
              <Link to="/organizations" className="btn-primary">
                Go to Organizations
              </Link>
            ) : (
              <button onClick={fetchCustomers} className="btn-secondary">
                Retry
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && customers.length === 0 && (
          <div className="p-8 text-center text-muted">
            {search ? (
              <>No customers found matching "{search}"</>
            ) : (
              <>
                No customers yet.{' '}
                <Link to="/customers/new" className="text-primary hover:underline">
                  Create your first customer
                </Link>
              </>
            )}
          </div>
        )}

        {/* Customers Table */}
        {!loading && !error && customers.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">External ID</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-border hover:bg-muted/10"
                    >
                      <td className="p-3">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {customer.email || '—'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {customer.phone || '—'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {customer.externalId || '—'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to{' '}
                {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                {pagination.total} customers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
