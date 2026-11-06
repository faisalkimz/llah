import { useState, useEffect, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import { api } from '../lib/api';
import { formatMoney, formatDate, formatDateTime, formatId } from '../lib/format.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Drawer from '../components/ui/Drawer.jsx';
import KeyValue from '../components/ui/KeyValue.jsx';
import Tabs from '../components/ui/Tabs.jsx';

const STATUS_TABS = [
  { value: 'All', label: 'All' },
  { value: 'SUCCEEDED', label: 'Succeeded' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially refunded' },
];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });
  const [detail, setDetail] = useState(null);

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
    if (statusFilter !== 'All') params.append('status', statusFilter);
    const res = await api(`/payments?${params}`);
    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : (res.data?.payments || []);
      setPayments(list);
      setPagination(prev => ({
        ...prev,
        total: res.meta?.total ?? res.data?.total ?? list.length,
      }));
    } else {
      setError(res.error?.message || 'Failed to load payments');
    }
    setLoading(false);
  }, [organizationId, pagination.limit, pagination.offset, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const visible = query.trim()
    ? payments.filter((p) => {
        const q = query.trim().toLowerCase();
        return [p.id, p.provider, p.providerPaymentId, p.invoiceId, p.status]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q));
      })
    : payments;

  const columns = [
    { key: 'id', header: 'Payment', mono: true, render: v => formatId(v, 14) },
    { key: 'provider', header: 'Provider', render: v => v ? String(v).charAt(0).toUpperCase() + String(v).slice(1).toLowerCase() : '—' },
    {
      key: 'amountMinor',
      header: 'Amount',
      align: 'right',
      render: (v, row) => <span className="tabular-nums font-medium">{formatMoney(v ?? row.amount, row.currency)}</span>,
    },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', header: 'Date', render: v => formatDate(v), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="Successful, pending, failed, and refunded charges for this organization."
      />

      <Tabs
        className="mb-4"
        tabs={STATUS_TABS}
        active={statusFilter}
        onChange={(value) => { setStatusFilter(value); setPagination(prev => ({ ...prev, offset: 0 })); }}
      />

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter this page by ID, provider, or status"
            className="input max-w-sm"
          />
        </div>

        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={fetchPayments} className="btn-secondary">Retry</button>
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={visible}
            loading={loading}
            onRowClick={row => setDetail(row)}
            emptyState={
              <EmptyState
                icon={CreditCard}
                title="No payments"
                description="Payments appear here after they are processed."
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

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Payment"
        description={detail ? formatMoney(detail.amountMinor ?? detail.amount, detail.currency) : undefined}
      >
        {detail && (
          <KeyValue
            items={[
              { label: 'Payment ID', value: detail.id, mono: true },
              { label: 'Amount', value: formatMoney(detail.amountMinor ?? detail.amount, detail.currency) },
              { label: 'Currency', value: detail.currency || 'USD' },
              { label: 'Status', value: <StatusBadge status={detail.status} /> },
              { label: 'Provider', value: detail.provider || '—' },
              { label: 'Provider reference', value: detail.providerPaymentId || '—', mono: true },
              { label: 'Invoice', value: detail.invoiceId || detail.invoice?.number || '—', mono: true },
              { label: 'Created', value: formatDateTime(detail.createdAt) },
              { label: 'Updated', value: formatDateTime(detail.updatedAt) },
            ].filter(item => item.value !== undefined)}
          />
        )}
      </Drawer>
    </>
  );
}
