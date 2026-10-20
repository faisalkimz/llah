import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const STATUS_STYLES = {
  OPEN: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-neutral-100 text-neutral-600',
  FAILED: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLES[status] || 'bg-neutral-100 text-neutral-600'}`}
    >
      {status}
    </span>
  );
}

export default function BillingPeriods() {
  const organizationId = localStorage.getItem('current_organization_id');

  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(null); // periodId currently being closed
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (organizationId) {
      fetchPeriods();
    } else {
      setLoading(false);
    }
  }, [organizationId]);

  async function fetchPeriods() {
    try {
      setLoading(true);
      setError(null);
      const response = await api('/billing-periods');
      if (response.success) {
        setPeriods(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error?.message || 'Failed to load billing periods');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function closePeriod(periodId) {
    if (!confirm('Close this billing period? This will generate an invoice.')) return;

    try {
      setClosing(periodId);
      setSuccessMsg(null);
      const response = await api(`/billing-periods/${periodId}/close`, {
        method: 'POST',
      });

      if (response.success) {
        const invoiceId = response.data?.invoiceId;
        setSuccessMsg(
          invoiceId
            ? `Period closed. Invoice created: ${invoiceId}`
            : 'Period closed successfully.'
        );
        await fetchPeriods();
      } else {
        setError(response.error?.message || 'Failed to close billing period');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setClosing(null);
    }
  }

  if (!organizationId) {
    return (
      <>
        <PageHeader title="Billing Periods" description="View and manage billing periods" />
        <div className="llah-card p-8 text-center">
          <div className="text-muted mb-2">No organization selected</div>
          <p className="text-sm text-muted-foreground">
            Select an organization to view billing periods.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Billing Periods" description="View and manage billing periods" />

      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          {successMsg}
          <button
            onClick={() => setSuccessMsg(null)}
            className="ml-3 text-green-600 hover:text-green-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="llah-card">
        {loading && (
          <div className="p-8 text-center text-muted">Loading billing periods...</div>
        )}

        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-destructive mb-2">Error: {error}</div>
            <button onClick={fetchPeriods} className="btn-secondary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && periods.length === 0 && (
          <div className="p-8 text-center text-muted">
            No billing periods found. Billing periods are created automatically when subscriptions
            are active.
          </div>
        )}

        {!loading && !error && periods.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Period</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Subscription ID
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Start Date
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    End Date
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id} className="border-t border-border hover:bg-muted/10">
                    <td className="p-3 text-sm font-mono text-muted-foreground" title={period.id}>
                      {period.id.slice(0, 8)}...
                    </td>
                    <td
                      className="p-3 text-sm font-mono text-muted-foreground"
                      title={period.subscriptionId}
                    >
                      {period.subscriptionId ? period.subscriptionId.slice(0, 8) + '...' : '—'}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={period.status} />
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {period.startDate
                        ? new Date(period.startDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {period.endDate
                        ? new Date(period.endDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3">
                      {period.status === 'OPEN' && (
                        <button
                          onClick={() => closePeriod(period.id)}
                          disabled={closing === period.id}
                          className="text-sm text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {closing === period.id ? 'Closing…' : 'Close Period'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
