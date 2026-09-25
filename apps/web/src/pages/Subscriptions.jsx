import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Subscriptions() {
  const { api } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const response = await api('/subscriptions');
      if (response.success) {
        setSubscriptions(Array.isArray(response.data) ? response.data : []);
      }
    } catch (e) {
      console.error('Failed to load subscriptions:', e);
    } finally {
      setLoading(false);
    }
  }

  async function cancelSubscription(subscriptionId, immediate = false) {
    const message = immediate 
      ? 'Cancel this subscription immediately? The customer will lose access.'
      : 'Mark this subscription to cancel at period end?';

    if (!confirm(message)) {
      return;
    }

    try {
      const response = await api(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ immediate })
      });

      if (response.success) {
        loadSubscriptions();
      }
    } catch (e) {
      console.error('Failed to cancel subscription:', e);
    }
  }

  function getStatusBadge(status) {
    const styles = {
      ACTIVE: 'bg-success/10 text-success',
      PAST_DUE: 'bg-yellow-100 text-yellow-700',
      CANCELED: 'bg-neutral-100 text-muted',
      PAUSED: 'bg-blue-100 text-blue-700'
    };

    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${styles[status] || ''}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${
          status === 'ACTIVE' ? 'bg-success' : 
          status === 'PAST_DUE' ? 'bg-yellow-500' : 
          'bg-neutral-400'
        }`}></span>
        {status}
      </span>
    );
  }

  return (
    <>
      <PageHeader 
        title="Subscriptions" 
        description="Manage customer subscriptions"
      />

      <div className="llah-card">
        <div className="overflow-x-auto">
          <table className="llah-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Current Period</th>
                <th>Cancel at End</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-muted mb-2">No subscriptions yet</div>
                    <p className="text-sm text-muted">Create subscriptions via API to start billing customers</p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-medium">{sub.customer?.name || '-'}</td>
                    <td>{sub.plan?.name || '-'}</td>
                    <td>{getStatusBadge(sub.status)}</td>
                    <td className="text-sm text-muted">
                      {new Date(sub.currentPeriodStart).toLocaleDateString()} - {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td>
                      {sub.cancelAtPeriodEnd ? (
                        <span className="text-xs text-danger">Yes</span>
                      ) : (
                        <span className="text-xs text-muted">No</span>
                      )}
                    </td>
                    <td>
                      {sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => cancelSubscription(sub.id, false)}
                            className="text-sm text-muted hover:text-ink"
                          >
                            Cancel at end
                          </button>
                          <button
                            onClick={() => cancelSubscription(sub.id, true)}
                            className="text-sm text-danger hover:underline"
                          >
                            Cancel now
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
