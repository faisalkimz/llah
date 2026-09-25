import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Payments() {
  const { api } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      const response = await api('/payments');
      if (response.success) {
        setPayments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      SUCCEEDED: 'bg-success/10 text-success',
      FAILED: 'bg-danger/10 text-danger',
      CANCELED: 'bg-neutral-100 text-muted'
    };

    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${styles[status] || ''}`}>
        {status}
      </span>
    );
  }

  return (
    <>
      <PageHeader 
        title="Payments" 
        description="Track payment transactions"
      />

      <div className="llah-card">
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-muted mb-2">No payments yet</div>
                    <p className="text-sm text-muted">Payments will appear here when processed</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-mono text-sm">{payment.id.slice(0, 12)}...</td>
                    <td className="capitalize">{payment.provider}</td>
                    <td className="font-medium">
                      ${(Number(payment.amountMinor) / 100).toFixed(2)} {payment.currency}
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td className="font-mono text-sm">
                      {payment.invoice?.number || '-'}
                    </td>
                    <td className="text-muted">
                      {new Date(payment.createdAt).toLocaleDateString()}
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
