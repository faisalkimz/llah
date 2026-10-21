import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable, { TablePagination } from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatCard from '../components/ui/StatCard.jsx';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';
const LIMIT = 20;

export default function Audit() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadLogs(); }, [offset, actionFilter, resourceTypeFilter]);

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
      const res = await api(`/audit?${params}`);
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
      if (!response.ok) { toast.error('Export failed: ' + (response.statusText || response.status)); return; }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'audit.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    }
  }

  const columns = [
    { key: 'action', header: 'Action', mono: true, render: v => v || '—' },
    { key: 'resourceType', header: 'Resource type', render: (v, row) => v || row.resource_type || row.targetType || '—', cellClassName: 'cell-muted' },
    { key: 'resourceId', header: 'Resource ID', mono: true, render: (v, row) => {
      const id = v || row.targetId || row.resource_id || '';
      return id ? id.slice(0, 14) + (id.length > 14 ? '…' : '') : '—';
    }},
    { key: 'actor', header: 'Actor', render: (v, row) => row.actorEmail || row.actor?.email || row.actorId || '—', cellClassName: 'cell-muted' },
    { key: 'ipAddress', header: 'IP', mono: true, render: (v, row) => v || row.ip_address || row.ip || '—', cellClassName: 'cell-muted' },
    { key: 'createdAt', header: 'Created', render: v => v ? new Date(v).toLocaleString() : '—', cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader
        title="Audit log"
        description="System activity log"
        action={<button onClick={handleExportCsv} className="btn-secondary">Export CSV</button>}
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Object.entries(stats).slice(0, 4).map(([key, count]) => (
            <StatCard key={key} label={key.replace(/_/g, ' ')} value={count} />
          ))}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">Action</label>
            <input type="text" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setOffset(0); }} placeholder="Filter by action…" className="input w-48" />
          </div>
          <div>
            <label className="label">Resource type</label>
            <input type="text" value={resourceTypeFilter} onChange={e => { setResourceTypeFilter(e.target.value); setOffset(0); }} placeholder="Filter by resource type…" className="input w-52" />
          </div>
          {(actionFilter || resourceTypeFilter) && (
            <button onClick={() => { setActionFilter(''); setResourceTypeFilter(''); setOffset(0); }} className="btn-secondary">Clear</button>
          )}
        </div>
      </div>

      {forbidden && (
        <div className="card p-12 text-center">
          <Shield className="h-12 w-12 text-muted mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-ink mb-2">Admin access required</h2>
          <p className="text-sm text-muted">You need admin permissions to view the audit log.</p>
        </div>
      )}

      {error && !forbidden && (
        <div className="card p-4 mb-4 border-danger/30 text-sm text-danger">
          {error} <button onClick={loadLogs} className="ml-3 underline">Retry</button>
        </div>
      )}

      {!forbidden && (
        <div className="card">
          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            emptyState={<EmptyState icon={Shield} title="No audit log entries" description="Actions will appear here as they occur." />}
          />
          {!loading && total > LIMIT && (
            <TablePagination offset={offset} limit={LIMIT} total={total} onPageChange={setOffset} />
          )}
        </div>
      )}
    </>
  );
}
