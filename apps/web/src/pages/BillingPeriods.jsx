import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

export default function BillingPeriods() {
  const toast = useToast();
  const organizationId = localStorage.getItem('current_organization_id');
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(null);
  const [closeConfirm, setCloseConfirm] = useState(null);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  useEffect(() => {
    if (organizationId) fetchPeriods();
    else { setLoading(false); }
  }, [organizationId, pagination.offset]);

  async function fetchPeriods() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const response = await api(`/billing-periods?${params}`);
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : (response.data?.periods || []);
        setPeriods(list);
        setPagination(prev => ({ ...prev, total: response.data?.total ?? list.length }));
      } else {
        setError(response.error?.message || 'Failed to load billing periods');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    if (!closeConfirm) return;
    try {
      setClosing(closeConfirm);
      const response = await api(`/billing-periods/${closeConfirm}/close`, { method: 'POST' });
      if (response.success) {
        const invoiceId = response.data?.invoiceId;
        toast.success(invoiceId ? `Period closed. Invoice: ${invoiceId.slice(0, 8)}…` : 'Period closed');
        fetchPeriods();
      } else {
        toast.error(response.error?.message || 'Failed to close billing period');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setClosing(null);
      setCloseConfirm(null);
    }
  }

  const columns = [
    { key: 'id', header: 'Period ID', mono: true, render: v => v?.slice(0, 12) + '…' },
    { key: 'subscriptionId', header: 'Subscription', mono: true, render: v => v ? v.slice(0, 12) + '…' : '—' },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'startDate', header: 'Start', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    { key: 'endDate', header: 'End', render: v => v ? new Date(v).toLocaleDateString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'actions',
      header: '',
      render: (_, row) => row.status === 'OPEN' ? (
        <button
          onClick={e => { e.stopPropagation(); setCloseConfirm(row.id); }}
          disabled={closing === row.id}
          className="text-xs btn-secondary disabled:opacity-50"
        >
          {closing === row.id ? 'Closing…' : 'Close period'}
        </button>
      ) : null,
    },
  ];

  if (!organizationId) {
    return (
      <>
        <PageHeader title="Billing periods" description="View and manage billing periods" />
        <EmptyState icon={Clock} title="No organization selected" description="Select an organization to view billing periods." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Billing periods" description="View and manage billing periods" />

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={fetchPeriods} className="btn-secondary">Retry</button>
          </div>
        )}
        {!error && (
          <DataTable
            columns={columns}
            data={periods}
            loading={loading}
            emptyState={
              <EmptyState
                icon={Clock}
                title="No billing periods"
                description="Billing periods are created automatically when subscriptions are active."
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

      <ConfirmModal
        open={!!closeConfirm}
        onClose={() => setCloseConfirm(null)}
        onConfirm={handleClose}
        title="Close billing period"
        description="Close this billing period? This will generate an invoice."
        confirmLabel="Close period"
        confirmVariant="btn-primary"
      />
    </>
  );
}
