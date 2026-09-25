import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

export default function Invoices() {
  const { api } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const response = await api('/invoices');
      if (response.success) {
        setInvoices(Array.isArray(response.data) ? response.data : []);
      }
    } catch (e) {
      console.error('Failed to load invoices:', e);
    } finally {
      setLoading(false);
    }
  }

  async function finalizeInvoice(invoiceId) {
    if (!confirm('Finalize this invoice? It will be marked as OPEN and sent to the customer.')) {
      return;
    }

    try {
      const response = await api(`/invoices/${invoiceId}/finalize`, {
        method: 'POST'
      });

      if (response.success) {
        loadInvoices();
      }
    } catch (e) {
      console.error('Failed to finalize invoice:', e);
    }
  }

  function getStatusBadge(status) {
    const styles = {
      DRAFT: 'bg-neutral-100 text-neutral-700',
      OPEN: 'bg-blue-100 text-blue-700',
      PAID: 'bg-success/10 text-success',
      VOID: 'bg-neutral-100 text-muted',
      UNCOLLECTIBLE: 'bg-danger/10 text-danger'
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
        title="Invoices" 
        description="View and manage customer invoices"
      />

      <div className="llah-card">
        <div className="overflow-x-auto">
          <table className="llah-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="text-muted mb-2">No invoices yet</div>
                    <p className="text-sm text-muted">Invoices will appear here when created</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-mono font-medium">{invoice.number}</td>
                    <td>{invoice.customer?.name || '-'}</td>
                    <td className="font-medium">
                      ${(Number(invoice.totalMinor) / 100).toFixed(2)} {invoice.currency}
                    </td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td className="text-muted">
                      {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="text-muted">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {invoice.status === 'DRAFT' && (
                        <button
                          onClick={() => finalizeInvoice(invoice.id)}
                          className="text-sm text-ink hover:underline"
                        >
                          Finalize
                        </button>
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
