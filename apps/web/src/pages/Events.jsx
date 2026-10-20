import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const LIMIT = 20;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [filterDraft, setFilterDraft] = useState({ action: '', resourceType: '' });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setError('Please select an organization first');
      return;
    }
    fetchStats();
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    fetchEvents();
  }, [offset, actionFilter, resourceTypeFilter, organizationId]);

  const fetchStats = async () => {
    try {
      const res = await api('/event-log/stats');
      if (res.success) {
        const raw = res.data?.stats || res.data || {};
        // Normalize: could be object {ACTION: count} or array [{action, count}]
        let statsArr = [];
        if (Array.isArray(raw)) {
          statsArr = raw.map((s) => ({ action: s.action || s.key, count: s.count }));
        } else if (typeof raw === 'object') {
          statsArr = Object.entries(raw).map(([action, count]) => ({ action, count }));
        }
        // Sort by count desc, show top 3
        statsArr.sort((a, b) => b.count - a.count);
        setStats(statsArr.slice(0, 3));
      }
    } catch (e) {
      // Stats are non-critical; fail silently
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
      });
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter);

      const res = await api(`/event-log?${params.toString()}`);
      if (res.success) {
        setEvents(res.data?.events || res.data || []);
        setTotal(res.data?.total ?? res.meta?.total ?? 0);
      } else {
        setError(res.error?.message || 'Failed to load event log');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setActionFilter(filterDraft.action);
    setResourceTypeFilter(filterDraft.resourceType);
    setOffset(0);
  };

  const handleClearFilters = () => {
    setFilterDraft({ action: '', resourceType: '' });
    setActionFilter('');
    setResourceTypeFilter('');
    setOffset(0);
  };

  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const truncate = (str, len = 18) =>
    str && str.length > len ? str.slice(0, len) + '…' : str || '—';

  return (
    <>
      <PageHeader
        title="Event Log"
        description="Audit trail of all actions in your organization"
      />

      {/* Stats Row */}
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {stats.map((s) => (
            <div
              key={s.action}
              className="llah-card p-3 flex flex-col gap-1"
            >
              <span className="text-xs text-muted-foreground truncate">{s.action}</span>
              <span className="text-lg font-semibold">{s.count?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="llah-card p-3 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Action</label>
          <input
            type="text"
            value={filterDraft.action}
            onChange={(e) =>
              setFilterDraft((p) => ({ ...p, action: e.target.value }))
            }
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="e.g. invoice.created"
            className="input w-44"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Resource Type</label>
          <input
            type="text"
            value={filterDraft.resourceType}
            onChange={(e) =>
              setFilterDraft((p) => ({ ...p, resourceType: e.target.value }))
            }
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="e.g. Invoice"
            className="input w-44"
          />
        </div>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
        >
          Filter
        </button>
        {(actionFilter || resourceTypeFilter) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted/10 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="llah-card">
        {loading && (
          <div className="p-8 text-center text-muted">Loading events…</div>
        )}

        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">{error}</div>
            {!error.includes('organization') && (
              <button
                onClick={fetchEvents}
                className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/10"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="p-8 text-center text-muted">No events found.</div>
        )}

        {!loading && !error && events.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Action</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Resource Type</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Resource ID</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actor ID</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt.id} className="border-t border-border hover:bg-muted/10">
                      <td className="p-3 text-sm font-medium">{evt.action || '—'}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {evt.resourceType || '—'}
                      </td>
                      <td
                        className="p-3 text-sm text-muted-foreground font-mono"
                        title={evt.resourceId || ''}
                      >
                        {truncate(evt.resourceId)}
                      </td>
                      <td
                        className="p-3 text-sm text-muted-foreground font-mono"
                        title={evt.actorId || ''}
                      >
                        {truncate(evt.actorId)}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {evt.createdAt
                          ? new Date(evt.createdAt).toLocaleString()
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
                {total > 0
                  ? `Showing ${offset + 1}–${Math.min(offset + LIMIT, total)} of ${total}`
                  : `Page ${currentPage}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
                  disabled={offset === 0}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setOffset((o) => o + LIMIT)}
                  disabled={offset + LIMIT >= total && total > 0}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
