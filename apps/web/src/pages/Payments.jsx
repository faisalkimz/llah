import { useState, useEffect, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Drawer from '../components/ui/Drawer.jsx';
import KeyValue from '../components/ui/KeyValue.jsx';

function fmt(minor, currency) {
  const n = Number(minor || 0);
  return (n / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

const STATUS_TABS = ['All', 'PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELED'];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
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

  const columns = [
    { key: 'id', header: 'Payment ID', mono: true, render: v => v?.slice(0, 14) + '…' },
    { key: 'provider', header: 'Provider', render: v => v ? String(v).charAt(0).toUpperCase() + String(v).slice(1).toLowerCase() : '—' },
    {
      key: 'amountMinor',
      header: 'Amount',
      align: 'right',
      render: (v, row) => <span className="tabular-nums">{fmt(v ?? row.amount, row.currency)}</span>,
    },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', header: 'Date', render: v => new Date(v).toLocaleDateString(), cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader title="Payments" description="Track payment transactions" />

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
            <button onClick={fetchPayments} className="btn-secondary">Retry</button>
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={payments}
            loading={loading}
            onRowClick={row => setDetail(row)}
            emptyState={
              <EmptyState
                icon={CreditCard}
                title="No payments"
                description="Payments will appear here when processed."
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
        title="Payment details"
      >
        {detail && (
          <KeyValue
            items={[
              { label: 'Payment ID', value: detail.id, mono: true },
              { label: 'Amount', value: fmt(detail.amountMinor ?? detail.amount, detail.currency) },
              { label: 'Status', value: <StatusBadge status={detail.status} /> },
              { label: 'Provider', value: detail.provider || '—' },
              { label: 'Invoice', value: detail.invoiceId || detail.invoice?.number || '—', mono: true },
              { label: 'Created', value: detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '—' },
            ]}
          />
        )}
      </Drawer>
    </>
  );
}
