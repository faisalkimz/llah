import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const REPORT_TYPES = [
  'INVOICE_SUMMARY',
  'REVENUE_SUMMARY',
  'SUBSCRIPTION_SUMMARY',
  'USAGE_SUMMARY',
  'TAX_SUMMARY',
];

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(REPORT_TYPES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [viewResult, setViewResult] = useState(null); // { reportId, data }
  const [resultLoading, setResultLoading] = useState(false);
  const intervalRef = useRef(null);

  const organizationId = localStorage.getItem('current_organization_id');

  const fetchReports = async () => {
    if (!organizationId) return;
    try {
      const res = await api('/reports');
      if (res.success) {
        setReports(res.data?.reports || res.data || []);
        setError(null);
      } else {
        setError(res.error?.message || 'Failed to load reports');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh if any report is pending/processing
  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setError('Please select an organization first');
      return;
    }
    fetchReports();
  }, [organizationId]);

  useEffect(() => {
    const hasPending = reports.some(
      (r) => r.status === 'PENDING' || r.status === 'PROCESSING'
    );
    if (hasPending) {
      intervalRef.current = setInterval(fetchReports, 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [reports]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api('/reports', {
        method: 'POST',
        body: JSON.stringify({ type: formType }),
      });
      if (res.success) {
        setShowForm(false);
        setFormType(REPORT_TYPES[0]);
        await fetchReports();
      } else {
        setFormError(res.error?.message || 'Failed to generate report');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResult = async (report) => {
    if (viewResult?.reportId === report.id) {
      setViewResult(null);
      return;
    }
    setResultLoading(true);
    try {
      const res = await api(`/reports/${report.id}`);
      if (res.success) {
        setViewResult({ reportId: report.id, data: res.data });
      }
    } catch (e) {
      // silently ignore
    } finally {
      setResultLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate and view billing reports"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Generate Report'}
          </button>
        }
      />

      {/* Generate Form */}
      {showForm && (
        <div className="llah-card p-4 mb-4">
          <h2 className="text-sm font-semibold mb-3">New Report</h2>
          <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Report Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="input"
                required
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Generating…' : 'Generate'}
            </button>
          </form>
          {formError && (
            <p className="mt-2 text-xs text-red-600">{formError}</p>
          )}
        </div>
      )}

      <div className="llah-card">
        {loading && (
          <div className="p-8 text-center text-muted">Loading reports…</div>
        )}

        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">{error}</div>
            {error.includes('organization') ? null : (
              <button
                onClick={fetchReports}
                className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/10"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="p-8 text-center text-muted">
            No reports yet. Generate one above.
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <>
                    <tr key={report.id} className="border-t border-border hover:bg-muted/10">
                      <td className="p-3 text-sm font-medium">
                        {report.type?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                            STATUS_BADGE[report.status] || 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="p-3">
                        {report.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleViewResult(report)}
                            disabled={resultLoading}
                            className="text-sm text-primary hover:underline disabled:opacity-50"
                          >
                            {viewResult?.reportId === report.id
                              ? 'Hide Result'
                              : 'View Result'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {viewResult?.reportId === report.id && (
                      <tr key={`${report.id}-result`} className="border-t border-border">
                        <td colSpan={4} className="p-4 bg-neutral-50">
                          <pre className="bg-neutral-50 p-4 rounded text-xs overflow-x-auto">
                            {JSON.stringify(viewResult.data, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
