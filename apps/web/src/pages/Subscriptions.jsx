import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

const STATUS_TABS = ['All', 'ACTIVE', 'CANCELED', 'PAST_DUE', 'PAUSED'];

export default function Subscriptions() {
  const toast = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });
  const [confirm, setConfirm] = useState(null); // { id, immediate, label }

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter, pagination.offset]);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      if (statusFilter !== 'All') params.append('status', statusFilter);
      const response = await api(`/subscriptions?${params}`);
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : (response.data?.subscriptions || []);
        setSubscriptions(list);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total ?? response.meta?.total ?? list.length,
        }));
      } else {
        setError(response.error?.message || 'Failed to load subscriptions');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm) return;
    try {
      const res = await api(`/subscriptions/${confirm.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ immediate: confirm.immediate }),
      });
      if (res.success) {
        toast.success('Subscription canceled');
        loadSubscriptions();
      } else {
        toast.error(res.error?.message || 'Failed to cancel subscription');
      }
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setConfirm(null);
    }
  }

  const columns = [
    { key: 'customer', header: 'Customer', render: (v, row) => row.customer?.name || '—' },
    { key: 'plan', header: 'Plan', render: (v, row) => row.plan?.name || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'currentPeriodStart',
      header: 'Current period',
      render: (v, row) => (
        <span className="text-muted text-xs">
          {v ? new Date(v).toLocaleDateString() : '—'}
          {row.currentPeriodEnd ? ` – ${new Date(row.currentPeriodEnd).toLocaleDateString()}` : ''}
        </span>
      ),
    },
    {
      key: 'cancelAtPeriodEnd',
      header: 'Cancel at end',
      render: v => v
        ? <span className="badge badge-warning"><span className="badge-dot bg-warning" />Yes</span>
        : <span className="text-muted text-xs">No</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => row.status === 'ACTIVE' && !row.cancelAtPeriodEnd ? (
        <div className="flex gap-3">
          <button
            onClick={e => { e.stopPropagation(); setConfirm({ id: row.id, immediate: false, label: 'Cancel at period end' }); }}
            className="text-xs text-muted hover:text-ink"
          >
            Cancel at end
          </button>
          <button
            onClick={e => { e.stopPropagation(); setConfirm({ id: row.id, immediate: true, label: 'Cancel now' }); }}
            className="text-xs text-danger hover:underline"
          >
            Cancel now
          </button>
        </div>
      ) : null,
    },
  ];

  return (
    <>
      <PageHeader title="Subscriptions" description="Manage customer subscriptions" />

      {/* Status tabs */}
      <div className="tab-list mb-4">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setPagination(prev => ({ ...prev, offset: 0 })); }}
            className={`tab ${statusFilter === tab ? 'tab-active' : ''}`}
          >
            {tab === 'All' ? 'All' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            <button onClick={loadSubscriptions} className="btn-secondary">Retry</button>
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={subscriptions}
            loading={loading}
            emptyState={
              <EmptyState
                icon={RefreshCw}
                title="No subscriptions"
                description="Subscriptions will appear here when created via API."
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
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleCancel}
        title="Cancel subscription"
        description={confirm?.immediate
          ? 'Cancel immediately? The customer will lose access now.'
          : 'Cancel at period end? The customer keeps access until then.'}
        confirmLabel={confirm?.label || 'Cancel subscription'}
        confirmVariant="btn-danger"
      />
    </>
  );
}
