import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (!organizationId) { setLoading(false); setError('Please select an organization first.'); return; }
    fetchAll();
  }, [organizationId, pagination.offset]);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: pagination.limit.toString(), offset: pagination.offset.toString() });
      const [listRes, countRes] = await Promise.all([
        api(`/notifications?${params}`),
        api('/notifications/unread-count'),
      ]);
      if (listRes.success) {
        const list = listRes.data?.notifications || (Array.isArray(listRes.data) ? listRes.data : []);
        setNotifications(list);
        setPagination(prev => ({ ...prev, total: listRes.data?.total ?? list.length }));
      } else {
        setError(listRes.error?.message || 'Failed to load notifications');
      }
      if (countRes.success) setUnreadCount(countRes.data?.count ?? countRes.data?.unreadCount ?? 0);
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(notification) {
    if (notification.readAt || notification.read) return;
    try {
      await api(`/notifications/${notification.id}/read`, { method: 'PATCH' });
      await fetchAll();
    } catch { /* silently ignore */ }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await api('/notifications/read-all', { method: 'POST' });
      await fetchAll();
    } finally {
      setMarkingAll(false);
    }
  }

  const isUnread = n => !n.readAt && !n.read;

  const columns = [
    {
      key: 'unread', header: '',
      render: (_, row) => isUnread(row) ? <span className="badge badge-info"><span className="badge-dot bg-info" />Unread</span> : null,
      width: 80,
    },
    { key: 'type', header: 'Type', render: v => v || '—', cellClassName: 'cell-muted' },
    {
      key: 'title',
      header: 'Title',
      render: (v, row) => (
        <span className={isUnread(row) ? 'font-medium text-ink' : 'text-muted'}>{v || row.message || '—'}</span>
      ),
    },
    { key: 'createdAt', header: 'Received', render: v => v ? new Date(v).toLocaleString() : '—', cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 ? (
            <button onClick={handleMarkAllRead} disabled={markingAll} className="btn-secondary disabled:opacity-50">
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
          ) : null
        }
      />

      {error && !loading && (
        <div className="card p-8 text-center">
          <div className="text-danger mb-2">{error}</div>
        </div>
      )}

      {!error && (
        <div className="card">
          <DataTable
            columns={columns}
            data={notifications}
            loading={loading}
            onRowClick={row => handleMarkRead(row)}
            emptyState={
              <EmptyState icon={Bell} title="No notifications" description="Notifications will appear here as events occur." />
            }
          />
          {!loading && pagination.total > pagination.limit && (
            <TablePagination
              offset={pagination.offset}
              limit={pagination.limit}
              total={pagination.total}
              onPageChange={offset => setPagination(prev => ({ ...prev, offset }))}
            />
          )}
        </div>
      )}
    </>
  );
}
