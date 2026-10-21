import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatCard from '../components/ui/StatCard.jsx';

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
  const [draft, setDraft] = useState({ action: '', resourceType: '' });

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (!organizationId) { setLoading(false); setError('Please select an organization first.'); return; }
    fetchStats();
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    fetchEvents();
  }, [offset, actionFilter, resourceTypeFilter, organizationId]);

  async function fetchStats() {
    try {
      const res = await api('/event-log/stats');
      if (res.success) {
        const raw = res.data?.stats || res.data || {};
        let arr = Array.isArray(raw) ? raw.map(s => ({ action: s.action || s.key, count: s.count })) : Object.entries(raw).map(([action, count]) => ({ action, count }));
        arr.sort((a, b) => b.count - a.count);
        setStats(arr.slice(0, 3));
      }
    } catch { /* non-critical */ }
  }

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: LIMIT.toString(), offset: offset.toString() });
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter);
      const res = await api(`/event-log?${params}`);
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
  }

  function applyFilters() { setActionFilter(draft.action); setResourceTypeFilter(draft.resourceType); setOffset(0); }
  function clearFilters() { setDraft({ action: '', resourceType: '' }); setActionFilter(''); setResourceTypeFilter(''); setOffset(0); }

  const columns = [
    { key: 'action', header: 'Action', render: v => <span className="font-medium">{v || '—'}</span> },
    { key: 'resourceType', header: 'Resource type', cellClassName: 'cell-muted' },
    { key: 'resourceId', header: 'Resource ID', mono: true, render: v => v ? v.slice(0, 18) + (v.length > 18 ? '…' : '') : '—' },
    { key: 'actorId', header: 'Actor ID', mono: true, render: v => v ? v.slice(0, 18) + (v.length > 18 ? '…' : '') : '—' },
    { key: 'createdAt', header: 'Created', render: v => v ? new Date(v).toLocaleString() : '—', cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader title="Event log" description="Audit trail of all actions in your organization" />

      {/* Stats row */}
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map(s => (
            <StatCard key={s.action} label={s.action} value={s.count?.toLocaleString()} />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Action</label>
            <input
              type="text"
              value={draft.action}
              onChange={e => setDraft(p => ({ ...p, action: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="e.g. invoice.created"
              className="input w-44"
            />
          </div>
          <div>
            <label className="label">Resource type</label>
            <input
              type="text"
              value={draft.resourceType}
              onChange={e => setDraft(p => ({ ...p, resourceType: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="e.g. Invoice"
              className="input w-44"
            />
          </div>
          <button onClick={applyFilters} className="btn-primary">Filter</button>
          {(actionFilter || resourceTypeFilter) && (
            <button onClick={clearFilters} className="btn-secondary">Clear</button>
          )}
        </div>
      </div>

      <div className="card">
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-danger mb-2">{error}</div>
            {!error.includes('organization') && (
              <button onClick={fetchEvents} className="btn-secondary">Retry</button>
            )}
          </div>
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={events}
            loading={loading}
            emptyState={
              <EmptyState icon={Terminal} title="No events found" description="Events will appear here as actions occur in your organization." />
            }
          />
        )}

        {!loading && !error && total > 0 && (
          <TablePagination
            offset={offset}
            limit={LIMIT}
            total={total}
            onPageChange={setOffset}
          />
        )}
      </div>
    </>
  );
}
