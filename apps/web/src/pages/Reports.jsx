import { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CodeBlock from '../components/ui/CodeBlock.jsx';
import Drawer from '../components/ui/Drawer.jsx';

const REPORT_TYPES = ['INVOICE_SUMMARY','REVENUE_SUMMARY','SUBSCRIPTION_SUMMARY','USAGE_SUMMARY','TAX_SUMMARY'];

export default function Reports() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formType, setFormType] = useState(REPORT_TYPES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [viewReport, setViewReport] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const intervalRef = useRef(null);

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (!organizationId) { setLoading(false); setError('Please select an organization first.'); return; }
    fetchReports();
  }, [organizationId]);

  useEffect(() => {
    const hasPending = reports.some(r => r.status === 'PENDING' || r.status === 'PROCESSING');
    if (hasPending) {
      intervalRef.current = setInterval(fetchReports, 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [reports]);

  async function fetchReports() {
    if (!organizationId) return;
    try {
      const res = await api('/reports');
      if (res.success) {
        setReports(res.data?.reports || (Array.isArray(res.data) ? res.data : []));
        setError(null);
      } else {
        setError(res.error?.message || 'Failed to load reports');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api('/reports', { method: 'POST', body: JSON.stringify({ type: formType }) });
      if (res.success) {
        toast.success('Report generation started');
        await fetchReports();
      } else {
        setFormError(res.error?.message || 'Failed to generate report');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleView(report) {
    setViewReport(report);
    setResultData(null);
    setResultLoading(true);
    try {
      const res = await api(`/reports/${report.id}`);
      if (res.success) setResultData(res.data);
    } catch {
      // silently ignore
    } finally {
      setResultLoading(false);
    }
  }

  const columns = [
    { key: 'type', header: 'Type', render: v => <span className="font-medium">{v?.replace(/_/g, ' ') || '—'}</span> },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', header: 'Created', render: v => v ? new Date(v).toLocaleString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'actions', header: '',
      render: (_, row) => row.status === 'COMPLETED' ? (
        <button onClick={e => { e.stopPropagation(); handleView(row); }} className="text-xs text-accent hover:underline">View result</button>
      ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate and view billing reports"
        action={
          <form onSubmit={handleGenerate} className="flex items-center gap-2">
            <select value={formType} onChange={e => setFormType(e.target.value)} className="select" style={{ width: 180 }}>
              {REPORT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
              {submitting ? 'Generating…' : 'Generate report'}
            </button>
          </form>
        }
      />

      {formError && <div className="card p-3 mb-4 border-danger/30 text-sm text-danger">{formError}</div>}

      {error && !loading && (
        <div className="card p-8 text-center">
          <div className="text-danger mb-2">{error}</div>
          {!error.includes('organization') && <button onClick={fetchReports} className="btn-secondary">Retry</button>}
        </div>
      )}

      {!error && (
        <div className="card">
          <DataTable
            columns={columns}
            data={reports}
            loading={loading}
            emptyState={
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="Generate a report using the selector above."
              />
            }
          />
        </div>
      )}

      <Drawer open={!!viewReport} onClose={() => setViewReport(null)} title={viewReport?.type?.replace(/_/g, ' ') || 'Report result'}>
        {resultLoading ? (
          <div className="text-muted text-sm">Loading result…</div>
        ) : resultData ? (
          <CodeBlock code={JSON.stringify(resultData, null, 2)} language="json" />
        ) : (
          <div className="text-muted text-sm">No result data available.</div>
        )}
      </Drawer>
    </>
  );
}
