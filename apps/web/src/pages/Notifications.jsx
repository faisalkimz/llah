import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const TYPE_BADGE = {
  INVOICE: 'bg-blue-100 text-blue-700',
  PAYMENT: 'bg-green-100 text-green-700',
  SUBSCRIPTION: 'bg-purple-100 text-purple-700',
  ALERT: 'bg-red-100 text-red-700',
  SYSTEM: 'bg-neutral-100 text-neutral-600',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setError('Please select an organization first');
      return;
    }
    fetchAll();
  }, [organizationId]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, countRes] = await Promise.all([
        api('/notifications?limit=20'),
        api('/notifications/unread-count'),
      ]);
      if (listRes.success) {
        setNotifications(
          listRes.data?.notifications || listRes.data || []
        );
      } else {
        setError(listRes.error?.message || 'Failed to load notifications');
      }
      if (countRes.success) {
        setUnreadCount(
          countRes.data?.count ?? countRes.data?.unreadCount ?? 0
        );
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notification) => {
    if (notification.readAt || notification.read) return;
    try {
      await api(`/notifications/${notification.id}/read`, { method: 'PATCH' });
      await fetchAll();
    } catch (e) {
      // silently ignore
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api('/notifications/read-all', { method: 'POST' });
      await fetchAll();
    } catch (e) {
      // silently ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const isUnread = (n) => !n.readAt && !n.read;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </span>
        }
        description="Your recent billing and system notifications"
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingAll ? 'Marking…' : 'Mark All Read'}
            </button>
          ) : null
        }
      />

      <div className="llah-card divide-y divide-border">
        {loading && (
          <div className="p-8 text-center text-muted">Loading notifications…</div>
        )}

        {error && !loading && (
          <div className="p-8 text-center text-red-600">{error}</div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-8 text-center text-muted">No notifications</div>
        )}

        {!loading &&
          !error &&
          notifications.map((n) => {
            const unread = isUnread(n);
            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={`flex items-start gap-4 p-4 transition-colors ${
                  unread
                    ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                    : 'bg-white hover:bg-muted/10'
                }`}
              >
                {/* Type Badge */}
                <div className="mt-0.5 shrink-0">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                      TYPE_BADGE[n.type] || 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {n.type || 'NOTIFICATION'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug truncate ${
                      unread ? 'font-semibold text-ink' : 'font-normal text-muted-foreground'
                    }`}
                  >
                    {n.title || n.subject || '—'}
                  </p>
                  {n.message && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {n.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString()
                      : '—'}
                  </p>
                </div>

                {/* Unread dot */}
                {unread && (
                  <div className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
