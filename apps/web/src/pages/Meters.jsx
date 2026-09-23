import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Meters() {
  const [meters, setMeters] = useState([]);
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
      fetchMeters();
    } else {
      setLoading(false);
      setError('Please select an organization first');
    }
  }, [search, pagination.offset, organizationId]);

  const fetchMeters = async () => {
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
      
      const response = await api(`/meters?${params.toString()}`);
      
      if (response.success) {
        setMeters(response.data.meters || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
        }));
      } else {
        setError(response.error?.message || 'Failed to load meters');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, offset: 0 }));
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
        title="Meters"
        description="Define what to measure for usage-based billing"
        action={
          <Link to="/meters/new" className="btn-primary">
            + New Meter
          </Link>
        }
      />

      <div className="llah-card">
        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="Search meters by name or key..."
            value={search}
            onChange={handleSearchChange}
            className="input w-full max-w-md"
          />
        </div>

        {loading && (
          <div className="p-8 text-center text-muted">
            Loading meters...
          </div>
        )}

        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-destructive mb-2">Error: {error}</div>
            {error.includes('organization') ? (
              <Link to="/organizations" className="btn-primary">
                Go to Organizations
              </Link>
            ) : (
              <button onClick={fetchMeters} className="btn-secondary">
                Retry
              </button>
            )}
          </div>
        )}

        {!loading && !error && meters.length === 0 && (
          <div className="p-8 text-center text-muted">
            {search ? (
              <>No meters found matching "{search}"</>
            ) : (
              <>
                No meters yet.{' '}
                <Link to="/meters/new" className="text-primary hover:underline">
                  Create your first meter
                </Link>
              </>
            )}
          </div>
        )}

        {!loading && !error && meters.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Key</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Unit</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Aggregation</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {meters.map((meter) => (
                    <tr
                      key={meter.id}
                      className="border-t border-border hover:bg-muted/10"
                    >
                      <td className="p-3">
                        <Link
                          to={`/meters/${meter.id}`}
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {meter.key}
                        </Link>
                      </td>
                      <td className="p-3 font-medium">{meter.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{meter.unit}</td>
                      <td className="p-3 text-sm text-muted-foreground">{meter.aggregation}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(meter.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to{' '}
                {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                {pagination.total} meters
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
