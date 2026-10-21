import { useState, useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

function formatDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null;
  const diff = (new Date(completedAt) - new Date(startedAt)) / 1000;
  return `${diff.toFixed(2)}s`;
}

export default function Jobs() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggering, setTriggering] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => { fetchJobs(); }, []);

  useEffect(() => {
    const hasRunning = jobs.some(j => j.status === 'RUNNING');
    if (hasRunning && !intervalRef.current) {
      intervalRef.current = setInterval(() => fetchJobs(false), 10000);
    } else if (!hasRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [jobs]);

  async function fetchJobs(showLoading = true) {
    if (showLoading) setLoading(true);
    setError(null);
    const response = await api('/jobs');
    if (response.success) setJobs(Array.isArray(response.data) ? response.data : []);
    else setError(response.error?.message || 'Failed to load job runs');
    if (showLoading) setLoading(false);
  }

  async function triggerJob(path, label) {
    setTriggering(prev => ({ ...prev, [path]: true }));
    const response = await api(path, { method: 'POST' });
    if (response.success) {
      toast.success(`${label} triggered`);
      fetchJobs(false);
    } else {
      toast.error(response.error?.message || `Failed to trigger ${label}`);
    }
    setTriggering(prev => ({ ...prev, [path]: false }));
  }

  const columns = [
    { key: 'name', header: 'Job name', render: (v, row) => <span className="font-medium">{v || row.jobName || '—'}</span> },
    { key: 'status', header: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'startedAt', header: 'Started', render: v => v ? new Date(v).toLocaleString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'completedAt', header: 'Completed',
      render: (v, row) => row.status === 'RUNNING' ? 'Running…' : (v ? new Date(v).toLocaleString() : '—'),
      cellClassName: 'cell-muted',
    },
    { key: 'duration', header: 'Duration', render: (_, row) => formatDuration(row.startedAt, row.completedAt) || '—', cellClassName: 'cell-muted' },
  ];

  return (
    <>
      <PageHeader title="Jobs" description="Background job history and manual triggers" />

      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { path: '/jobs/subscriptions/process-expired', label: 'Process expired subscriptions' },
          { path: '/jobs/alerts/evaluate', label: 'Evaluate alerts' },
        ].map(({ path, label }) => (
          <button
            key={path}
            onClick={() => triggerJob(path, label)}
            disabled={!!triggering[path]}
            className="btn-secondary disabled:opacity-50"
          >
            {triggering[path] ? 'Triggering…' : label}
          </button>
        ))}
      </div>

      {error && !loading && (
        <div className="card p-4 mb-4 text-sm text-danger">
          {error} <button onClick={() => fetchJobs()} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="card">
        <DataTable
          columns={columns}
          data={jobs}
          loading={loading}
          emptyState={<EmptyState icon={Activity} title="No job runs" description="Job runs will appear here when triggered." />}
        />
      </div>
    </>
  );
}
