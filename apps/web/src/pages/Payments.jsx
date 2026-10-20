import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

function getStatusBadge(status) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUCCEEDED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-neutral-100 text-neutral-600',
    PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-700',
    CANCELED: 'bg-neutral-100 text-neutral-600',
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded ${
        styles[status] || 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {status}
    </span>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  const fetchPayments = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      setError('Please select an organization first.');
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      limit: pagination.limit.toString(),
      offset: pagination.offset.toString(),
    });
    const res = await api(`/payments?${params}`);
    if (res.success) {
      const list =
        Array.isArray(res.data) ? res.data : res.data?.payments || [];
      setPayments(list);
      setPagination((prev) => ({
        ...prev,
        total: res.meta?.total ?? res.data?.total ?? list.length,
      }));
    } else {
      setError(res.error?.message || 'Failed to load payments');
    }
    setLoading(false);
  }, [organizationId, pagination.limit, pagination.offset]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  function handleNextPage() {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  }

  function handlePrevPage() {
    setPagination((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Track payment transactions"
      />

      <div className="llah-card">
        {/* Loading */}
        {loading && (
          <div className="p-8 text-center text-muted">Loading payments...</div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Error: {error}</div>
            <button onClick={fetchPayments} className="btn-secondary">
              Retry
            </button>
          </div>
        )}

        {/* No org */}
        {!loading && !error && !organizationId && (
          <div className="p-8 text-center text-muted">
            Please select an organization to view payments.
          </div>
        )}

        {/* Empty */}
        {!loading && !error && organizationId && payments.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-muted mb-2">No payments yet</div>
            <p className="text-sm text-muted">
              Payments will appear here when processed
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && payments.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="llah-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Provider</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Invoice</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-mono text-sm">
                        {payment.id?.slice(0, 12)}…
                      </td>
                      <td className="capitalize">{payment.provider || '—'}</td>
                      <td className="font-medium">
                        $
                        {(
                          Number(payment.amountMinor ?? payment.amount ?? 0) /
                          100
                        ).toFixed(2)}{' '}
                        {payment.currency || ''}
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td className="font-mono text-sm">
                        {payment.invoiceId ||
                          payment.invoice?.number ||
                          payment.invoice?.id ||
                          '—'}
                      </td>
                      <td className="text-muted">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1}–
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{' '}
                of {pagination.total} payments
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={
                    pagination.offset + pagination.limit >= pagination.total
                  }
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
