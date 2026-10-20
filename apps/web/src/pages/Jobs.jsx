import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

function StatusBadge({ status }) {
  const classes = {
    RUNNING: 'bg-blue-100 text-blue-700',
    SUCCEEDED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        classes[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}

function formatDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null;
  const diff = (new Date(completedAt) - new Date(startedAt)) / 1000;
  return `${diff.toFixed(2)}s`;
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggerResult, setTriggerResult] = useState(null); // { message, isError }
  const [triggering, setTriggering] = useState({}); // keyed by job type
  const intervalRef = useRef(null);

  const organizationId = localStorage.getItem('current_organization_id');

  const fetchJobs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    const response = await api('/jobs');
    if (response.success) {
      setJobs(response.data || []);
    } else {
      setError(response.error?.message || 'Failed to load job runs');
    }
    if (showLoading) setLoading(false);
  };

  // Auto-refresh every 10s when any job is RUNNING
  useEffect(() => {
    fetchJobs();
  }, [organizationId]);

  useEffect(() => {
    const hasRunning = jobs.some((j) => j.status === 'RUNNING');

    if (hasRunning && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        fetchJobs(false);
      }, 10000);
    } else if (!hasRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobs]);

  const triggerJob = async (path, label) => {
    setTriggering((prev) => ({ ...prev, [path]: true }));
    setTriggerResult(null);

    const response = await api(path, { method: 'POST' });

    if (response.success) {
      setTriggerResult({
        message: response.data?.message || `${label} triggered successfully.`,
        isError: false,
      });
      // Refresh the list after triggering
      fetchJobs(false);
    } else {
      setTriggerResult({
        message: response.error?.message || `Failed to trigger ${label}.`,
        isError: true,
      });
    }

    setTriggering((prev) => ({ ...prev, [path]: false }));
  };

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Background job history and manual triggers"
      />

      {/* Trigger Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() =>
            triggerJob(
              '/jobs/subscriptions/process-expired',
              'Process Expired Subscriptions'
            )
          }
          disabled={triggering['/jobs/subscriptions/process-expired']}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {triggering['/jobs/subscriptions/process-expired']
            ? 'Triggering...'
            : 'Process Expired Subscriptions'}
        </button>
        <button
          onClick={() =>
            triggerJob('/jobs/alerts/evaluate', 'Evaluate Alerts')
          }
          disabled={triggering['/jobs/alerts/evaluate']}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {triggering['/jobs/alerts/evaluate']
            ? 'Triggering...'
            : 'Evaluate Alerts'}
        </button>
      </div>

      {/* Trigger Result Banner */}
      {triggerResult && (
        <div
          className={`flex items-start justify-between gap-4 p-3 rounded mb-4 text-sm ${
            triggerResult.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          <span>{triggerResult.message}</span>
          <button
            onClick={() => setTriggerResult(null)}
            className="shrink-0 text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* No-org state */}
      {!organizationId && !loading && (
        <div className="llah-card p-8 text-center text-muted">
          Please select an organization first.
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="llah-card p-8 text-center text-muted">
          Loading job runs...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="llah-card p-8 text-center">
          <div className="text-destructive mb-2">Error: {error}</div>
          <button onClick={() => fetchJobs()} className="btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Jobs Table */}
      {!loading && !error && (
        <div className="llah-card">
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No job runs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Job Name
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Started At
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Completed At
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const duration = formatDuration(
                      job.startedAt,
                      job.completedAt
                    );
                    return (
                      <tr
                        key={job.id}
                        className="border-t border-border hover:bg-muted/10"
                      >
                        <td className="p-3 font-medium text-sm">{job.name || job.jobName || '—'}</td>
                        <td className="p-3">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {job.startedAt
                            ? new Date(job.startedAt).toLocaleString()
                            : '—'}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {job.status === 'RUNNING'
                            ? 'Running...'
                            : job.completedAt
                            ? new Date(job.completedAt).toLocaleString()
                            : '—'}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {duration || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
