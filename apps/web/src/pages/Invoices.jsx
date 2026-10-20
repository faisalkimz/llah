import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

function getStatusBadge(status) {
  const styles = {
    DRAFT: 'bg-neutral-100 text-neutral-600',
    OPEN: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    VOID: 'bg-neutral-100 text-neutral-600',
    UNCOLLECTIBLE: 'bg-red-100 text-red-700',
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

function InvoiceDetail({ invoiceId, onBack, onReload }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api(`/invoices/${invoiceId}`);
    if (res.success) {
      setInvoice(res.data);
    } else {
      setError(res.error?.message || 'Failed to load invoice');
    }
    setLoading(false);
  }, [invoiceId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  async function handleFinalize() {
    if (!confirm('Finalize this invoice? It will be marked as OPEN and sent to the customer.')) return;
    setActionLoading(true);
    const res = await api(`/invoices/${invoice.id}/finalize`, { method: 'POST' });
    setActionLoading(false);
    if (res.success) {
      await fetchDetail();
      onReload();
    } else {
      alert(res.error?.message || 'Failed to finalize invoice');
    }
  }

  async function handleVoid() {
    if (!confirm('Void this invoice? This action cannot be undone.')) return;
    setActionLoading(true);
    const res = await api(`/invoices/${invoice.id}/void`, { method: 'POST' });
    setActionLoading(false);
    if (res.success) {
      await fetchDetail();
      onReload();
    } else {
      alert(res.error?.message || 'Failed to void invoice');
    }
  }

  if (loading) {
    return (
      <div className="llah-card p-8 text-center text-muted">
        Loading invoice details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="llah-card p-8 text-center">
        <div className="text-red-600 mb-3">Error: {error}</div>
        <button onClick={onBack} className="btn-secondary">
          Back to list
        </button>
      </div>
    );
  }

  const lineItems = invoice.lineItems || invoice.lines || [];
  const subtotalMinor = lineItems.reduce(
    (sum, item) => sum + (Number(item.totalAmountMinor ?? item.amount ?? 0)),
    0
  );
  const totalMinor = Number(invoice.totalAmountMinor ?? invoice.totalMinor ?? 0);
  const taxMinor = totalMinor - subtotalMinor;

  return (
    <div className="space-y-4">
      {/* Back button + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          ← Back to list
        </button>
        <div className="flex items-center gap-2">
          {invoice.status === 'DRAFT' && (
            <button
              onClick={handleFinalize}
              disabled={actionLoading}
              className="btn-primary disabled:opacity-50"
            >
              Finalize
            </button>
          )}
          {invoice.status === 'OPEN' && (
            <button
              onClick={handleVoid}
              disabled={actionLoading}
              className="btn-secondary text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Void
            </button>
          )}
        </div>
      </div>

      {/* Detail card */}
      <div className="llah-card">
        {/* Header section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Invoice {invoice.number || invoice.id}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                {getStatusBadge(invoice.status)}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground space-y-1">
              <div>
                <span className="font-medium text-ink">Invoice ID:</span>{' '}
                <span className="font-mono">{invoice.id}</span>
              </div>
              <div>
                <span className="font-medium text-ink">Created:</span>{' '}
                {invoice.createdAt
                  ? new Date(invoice.createdAt).toLocaleDateString()
                  : '—'}
              </div>
              {invoice.dueAt && (
                <div>
                  <span className="font-medium text-ink">Due:</span>{' '}
                  {new Date(invoice.dueAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Customer */}
          {invoice.customer && (
            <div className="mt-4 text-sm">
              <span className="font-medium text-ink">Customer: </span>
              <span className="text-muted-foreground">
                {invoice.customer.name}
                {invoice.customer.email ? ` (${invoice.customer.email})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Line items table */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-ink mb-3">Line Items</h3>
          {lineItems.length === 0 ? (
            <p className="text-sm text-muted">No line items</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-right p-3 font-medium text-muted-foreground">
                      Qty
                    </th>
                    <th className="text-right p-3 font-medium text-muted-foreground">
                      Unit Price
                    </th>
                    <th className="text-right p-3 font-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={item.id || idx} className="border-t border-border">
                      <td className="p-3 text-ink">
                        {item.description || '—'}
                      </td>
                      <td className="p-3 text-right text-muted-foreground">
                        {item.quantity ?? '—'}
                      </td>
                      <td className="p-3 text-right text-muted-foreground">
                        $
                        {(
                          Number(
                            item.unitAmountMinor ??
                              item.unitAmount ??
                              0
                          ) / 100
                        ).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-medium text-ink">
                        $
                        {(
                          Number(
                            item.totalAmountMinor ??
                              item.amount ??
                              0
                          ) / 100
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="mt-4 border-t border-border pt-4 flex justify-end">
            <div className="w-56 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(subtotalMinor / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${Math.max(taxMinor, 0) / 100 > 0 ? (Math.max(taxMinor, 0) / 100).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between font-semibold text-ink border-t border-border pt-2">
                <span>Total</span>
                <span>${(totalMinor / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  const fetchInvoices = useCallback(async () => {
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
    const res = await api(`/invoices?${params}`);
    if (res.success) {
      const list =
        Array.isArray(res.data) ? res.data : res.data?.invoices || [];
      setInvoices(list);
      setPagination((prev) => ({
        ...prev,
        total: res.meta?.total ?? res.data?.total ?? list.length,
      }));
    } else {
      setError(res.error?.message || 'Failed to load invoices');
    }
    setLoading(false);
  }, [organizationId, pagination.limit, pagination.offset]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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

  // ── Detail view ────────────────────────────────────────────────────────────
  if (selectedInvoice) {
    return (
      <>
        <PageHeader
          title="Invoice Detail"
          description="View invoice details and manage status"
        />
        <InvoiceDetail
          invoiceId={selectedInvoice}
          onBack={() => setSelectedInvoice(null)}
          onReload={fetchInvoices}
        />
      </>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Invoices"
        description="View and manage customer invoices"
      />

      <div className="llah-card">
        {/* Loading */}
        {loading && (
          <div className="p-8 text-center text-muted">Loading invoices...</div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Error: {error}</div>
            <button onClick={fetchInvoices} className="btn-secondary">
              Retry
            </button>
          </div>
        )}

        {/* No org */}
        {!loading && !error && !organizationId && (
          <div className="p-8 text-center text-muted">
            Please select an organization to view invoices.
          </div>
        )}

        {/* Empty */}
        {!loading && !error && organizationId && invoices.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-muted mb-2">No invoices yet</div>
            <p className="text-sm text-muted">
              Invoices will appear here when created
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && invoices.length > 0 && (
          <>
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
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/10"
                      onClick={() => setSelectedInvoice(invoice.id)}
                    >
                      <td className="font-mono font-medium">
                        {invoice.number || invoice.id?.slice(0, 8) + '…'}
                      </td>
                      <td>{invoice.customer?.name || '—'}</td>
                      <td className="font-medium">
                        $
                        {(
                          Number(
                            invoice.totalAmountMinor ??
                              invoice.totalMinor ??
                              0
                          ) / 100
                        ).toFixed(2)}{' '}
                        {invoice.currency || ''}
                      </td>
                      <td>{getStatusBadge(invoice.status)}</td>
                      <td className="text-muted">
                        {invoice.dueAt
                          ? new Date(invoice.dueAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="text-muted">
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString()
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
                of {pagination.total} invoices
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
