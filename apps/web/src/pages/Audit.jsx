import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';
const LIMIT = 20;

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [offset, actionFilter, resourceTypeFilter]);

  async function loadStats() {
    const res = await api('/audit/stats');
    if (res.success) setStats(res.data);
  }

  async function loadLogs() {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);

      const params = new URLSearchParams({ limit: LIMIT.toString(), offset: offset.toString() });
      if (actionFilter.trim()) params.append('action', actionFilter.trim());
      if (resourceTypeFilter.trim()) params.append('resourceType', resourceTypeFilter.trim());

      const res = await api(`/audit?${params.toString()}`);

      if (!res.success) {
        if (res.error?.code === 'FORBIDDEN' || res.error?.message?.toLowerCase().includes('forbidden') || res.error?.message?.toLowerCase().includes('admin')) {
          setForbidden(true);
        } else {
          setError(res.error?.message || 'Failed to load audit logs');
        }
        return;
      }

      const raw = Array.isArray(res.data) ? res.data : (res.data?.logs || res.data?.items || []);
      setLogs(raw);
      setTotal(res.data?.total || res.meta?.total || raw.length);
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(setter) {
    return (e) => {
      setter(e.target.value);
      setOffset(0);
    };
  }

  async function handleExportCsv() {
    try {
      const token = localStorage.getItem('llah_access_token');
      const orgId = localStorage.getItem('current_organization_id');
      const response = await fetch(`${BASE}/audit/export?format=csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(orgId ? { 'x-organization-id': orgId } : {}),
        },
      });
      if (!response.ok) {
        alert('Export failed: ' + (response.statusText || response.status));
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + e.message);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="System activity log (admin only)"
        action={{
          label: 'Export CSV',
          onClick: handleExportCsv,
        }}
      />

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Object.entries(stats).map(([key, count]) => (
            <div key={key} className="llah-card p-4">
              <div className="text-xs text-muted mb-1 uppercase tracking-wide">{key.replace(/_/g, ' ')}</div>
              <div className="text-xl font-bold text-ink">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={actionFilter}
          onChange={handleFilterChange(setActionFilter)}
          placeholder="Filter by action…"
          className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 w-48"
        />
        <input
          type="text"
          value={resourceTypeFilter}
          onChange={handleFilterChange(setResourceTypeFilter)}
          placeholder="Filter by resource type…"
          className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 w-52"
        />
        {(actionFilter || resourceTypeFilter) && (
          <button
            onClick={() => { setActionFilter(''); setResourceTypeFilter(''); setOffset(0); }}
            className="px-3 py-2 border border-line rounded-lg text-sm hover:bg-neutral-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Forbidden */}
      {forbidden && (
        <div className="llah-card p-12 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-ink mb-2">Admin access required</h2>
          <p className="text-muted text-sm">You need admin permissions to view the audit log.</p>
        </div>
      )}

      {/* Error */}
      {error && !forbidden && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
          <button onClick={loadLogs} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Table */}
      {!forbidden && (
        <div className="llah-card">
          <div className="overflow-x-auto">
            <table className="llah-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource Type</th>
                  <th>Resource ID</th>
                  <th>Actor</th>
                  <th>IP Address</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted">Loading audit logs…</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted">No audit log entries found</td>
                  </tr>
                ) : (
                  logs.map((log, i) => {
                    const targetId = log.targetId || log.resourceId || log.resource_id || '';
                    const actor = log.actorEmail || log.actor?.email || log.actorId || log.actor?.id || '—';
                    return (
                      <tr key={log.id || i}>
                        <td className="font-mono text-xs">{log.action || '—'}</td>
                        <td className="text-sm">{log.resourceType || log.resource_type || log.targetType || '—'}</td>
                        <td className="font-mono text-xs text-muted" title={targetId}>
                          {targetId ? targetId.slice(0, 12) + (targetId.length > 12 ? '…' : '') : '—'}
                        </td>
                        <td className="text-sm">{actor}</td>
                        <td className="font-mono text-xs text-muted">{log.ipAddress || log.ip_address || log.ip || '—'}</td>
                        <td className="text-sm text-muted">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && total > LIMIT && (
            <div className="p-4 border-t border-line flex items-center justify-between">
              <div className="text-sm text-muted">
                Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                  disabled={offset === 0}
                  className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setOffset(o => o + LIMIT)}
                  disabled={offset + LIMIT >= total}
                  className="px-3 py-1.5 text-sm border border-line rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
