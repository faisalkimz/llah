import { useState, useEffect, useCallback } from 'react';
import { Receipt } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

const STATUS_TABS = ['All', 'DRAFT', 'OPEN', 'PAID', 'VOID'];

function fmt(minor) {
  const n = typeof minor === 'bigint' ? Number(minor) : Number(minor || 0);
  return (n / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function InvoiceDetail({ invoiceId, onBack, onReload }) {
  const toast = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'finalize' | 'void'

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    const res = await api(`/invoices/${invoiceId}`);
    if (res.success) setInvoice(res.data);
    setLoading(false);
  }, [invoiceId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  async function handleAction() {
    if (!confirmAction) return;
    setActionLoading(true);
    const res = await api(`/invoices/${invoice.id}/${confirmAction}`, { method: 'POST' });
    setActionLoading(false);
    if (res.success) {
      toast.success(`Invoice ${confirmAction}d`);
      await fetchDetail();
      onReload();
    } else {
      toast.error(res.error?.message || `Failed to ${confirmAction} invoice`);
    }
    setConfirmAction(null);
  }

  if (loading) {
    return <div className="card p-8 text-center text-muted">Loading invoice details...</div>;
  }
  if (!invoice) {
    return (
      <div className="card p-8 text-center">
        <div className="text-danger mb-3">Invoice not found</div>
        <button onClick={onBack} className="btn-secondary">Back to list</button>
      </div>
    );
  }

  const lineItems = invoice.lineItems || invoice.lines || [];
  const totalMinor = Number(invoice.totalAmountMinor ?? invoice.totalMinor ?? 0);
  const subtotalMinor = lineItems.reduce((s, i) => s + Number(i.totalAmountMinor ?? i.amount ?? 0), 0);
  const taxMinor = Math.max(0, totalMinor - subtotalMinor);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost text-sm">
          ← Back to list
        </button>
        <div className="flex gap-2">
          {invoice.status === 'DRAFT' && (
            <button onClick={() => setConfirmAction('finalize')} className="btn-primary">Finalize</button>
          )}
          {invoice.status === 'OPEN' && (
            <button onClick={() => setConfirmAction('void')} className="btn-secondary text-danger">Void</button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-ink">Invoice {invoice.number || invoice.id}</h2>
            <div className="mt-1.5">
              <StatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="text-right text-sm space-y-1">
            <div className="text-muted">
              ID: <span className="font-mono text-ink">{invoice.id?.slice(0, 16)}</span>
            </div>
            <div className="text-muted">
              Created: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '—'}
            </div>
            {invoice.dueAt && (
              <div className="text-muted">
                Due: {new Date(invoice.dueAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {invoice.customer && (
          <div className="px-5 py-3 border-b border-line text-sm">
            <span className="font-medium text-ink">Customer: </span>
            <span className="text-muted">{invoice.customer.name}{invoice.customer.email ? ` (${invoice.customer.email})` : ''}</span>
          </div>
        )}

        <div className="p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Line items</h3>
          {lineItems.length === 0 ? (
            <p className="text-sm text-muted">No line items</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>{item.description || '—'}</td>
                      <td className="text-right tabular-nums">{item.quantity ?? '—'}</td>
                      <td className="text-right tabular-nums">{fmt(item.unitAmountMinor ?? item.unitAmount)}</td>
                      <td className="text-right tabular-nums font-medium">{fmt(item.totalAmountMinor ?? item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 border-t border-line pt-4 flex justify-end">
            <div className="w-52 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Tax</span>
                <span className="tabular-nums">{fmt(taxMinor)}</span>
              </div>
              <div className="flex justify-between font-semibold text-ink border-t border-line pt-2">
                <span>Total</span>
                <span className="tabular-nums">{fmt(totalMinor)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        title={confirmAction === 'finalize' ? 'Finalize invoice' : 'Void invoice'}
        description={confirmAction === 'finalize'
          ? 'Mark as OPEN and notify the customer?'
          : 'This action cannot be undone.'}
        confirmLabel={confirmAction === 'finalize' ? 'Finalize' : 'Void invoice'}
        confirmVariant={confirmAction === 'void' ? 'btn-danger' : 'btn-primary'}
      />
    </div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
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
    if (statusFilter !== 'All') params.append('status', statusFilter);
    const res = await api(`/invoices?${params}`);
    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : (res.data?.invoices || []);
      setInvoices(list);
      setPagination(prev => ({
        ...prev,
        total: res.meta?.total ?? res.data?.total ?? list.length,
      }));
    } else {
      setError(res.error?.message || 'Failed to load invoices');
    }
    setLoading(false);
  }, [organizationId, pagination.limit, pagination.offset, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  if (selectedInvoice) {
    return (
      <>
        <PageHeader title="Invoice detail" />
        <InvoiceDetail
          invoiceId={selectedInvoice}
          onBack={() => setSelectedInvoice(null)}
          onReload={fetchInvoices}
        />
      </>
    );
  }

  const columns = [
    { key: 'number', header: 'Number', mono: true, render: (v, row) => v || row.id?.slice(0, 8) + '…' },
    { key: 'customer', header: 'Customer', render: (v, row) => row.customer?.name || '—' },
    {
      key: 'totalAmountMinor',
      header: 'Amount',
      align: 'right',
      render: (v, row) => (
        <span className="tabular-nums">{fmt(v ?? row.totalMinor)}</span>
      ),
    },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'dueAt', header: 'Due', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    { key: 'createdAt', header: 'Created', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader title="Invoices" description="View and manage customer invoices" />

      <div className="tab-list mb-4">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setPagination(prev => ({ ...prev, offset: 0 })); }}
            className={`tab ${statusFilter === tab ? 'tab-active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={fetchInvoices} className="btn-secondary">Retry</button>
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={invoices}
            loading={loading}
            onRowClick={row => setSelectedInvoice(row.id)}
            emptyState={
              <EmptyState
                icon={Receipt}
                title="No invoices"
                description="Invoices will appear here when created."
              />
            }
          />
        )}

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
