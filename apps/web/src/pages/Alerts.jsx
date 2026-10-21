import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Drawer from '../components/ui/Drawer.jsx';

const METRIC_OPTIONS = ['USAGE_AMOUNT','INVOICE_OVERDUE_DAYS','PAYMENT_FAILURE_COUNT','MRR_DROP_PERCENT'];
const OPERATOR_OPTIONS = ['GT','GTE','LT','LTE'];
const TABS = ['Rules', 'Firings'];

export default function Alerts() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Rules');
  const [rules, setRules] = useState([]);
  const [firings, setFirings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firingsLoading, setFiringsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', metric: METRIC_OPTIONS[0], threshold: '', operator: OPERATOR_OPTIONS[0] });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolveConfirm, setResolveConfirm] = useState(null);
  const [resolving, setResolving] = useState(false);

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (!organizationId) { setLoading(false); setError('Please select an organization first.'); return; }
    fetchRules();
  }, [organizationId]);

  useEffect(() => {
    if (activeTab === 'Firings' && organizationId) fetchFirings();
  }, [activeTab, organizationId]);

  async function fetchRules() {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/alerts');
      if (res.success) setRules(res.data?.alerts || (Array.isArray(res.data) ? res.data : []));
      else setError(res.error?.message || 'Failed to load alert rules');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function fetchFirings() {
    setFiringsLoading(true);
    try {
      const res = await api('/alerts/firings?limit=20');
      if (res.success) setFirings(res.data?.firings || (Array.isArray(res.data) ? res.data : []));
    } catch { /* ignore */ }
    finally { setFiringsLoading(false); }
  }

  async function handleCreateRule(e) {
    e.preventDefault();
    if (!form.name || !form.threshold) { setFormError('Name and threshold are required.'); return; }
    const threshold = parseFloat(form.threshold);
    if (isNaN(threshold)) { setFormError('Threshold must be a number.'); return; }
    try {
      setFormError(null);
      setSubmitting(true);
      const res = await api('/alerts', { method: 'POST', body: JSON.stringify({ ...form, threshold }) });
      if (res.success) {
        setForm({ name: '', metric: METRIC_OPTIONS[0], threshold: '', operator: OPERATOR_OPTIONS[0] });
        setShowForm(false);
        toast.success('Alert rule created');
        fetchRules();
      } else {
        setFormError(res.error?.message || 'Failed to create rule');
      }
    } catch (e) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }

  async function handleToggleActive(rule) {
    try {
      const res = await api(`/alerts/${rule.id}`, { method: 'PATCH', body: JSON.stringify({ active: !rule.active }) });
      if (res.success) { toast.success(`Alert ${rule.active ? 'disabled' : 'enabled'}`); fetchRules(); }
      else toast.error(res.error?.message || 'Failed to update alert');
    } catch (e) { toast.error(e.message); }
  }

  async function handleResolve() {
    if (!resolveConfirm) return;
    try {
      setResolving(true);
      const res = await api(`/alerts/firings/${resolveConfirm}/resolve`, { method: 'POST' });
      if (res.success) { toast.success('Firing resolved'); fetchFirings(); }
      else toast.error(res.error?.message || 'Failed to resolve');
    } catch (e) { toast.error(e.message); }
    finally { setResolving(false); setResolveConfirm(null); }
  }

  const ruleColumns = [
    { key: 'name', header: 'Name', render: v => <span className="font-medium text-ink">{v}</span> },
    { key: 'metric', header: 'Metric', cellClassName: 'cell-muted' },
    { key: 'operator', header: 'Operator', cellClassName: 'cell-muted' },
    { key: 'threshold', header: 'Threshold', render: v => <span className="tabular-nums">{v}</span> },
    { key: 'active', header: 'Status', render: v => <StatusBadge status={v ? 'ACTIVE' : 'DISABLED'} /> },
    {
      key: 'actions', header: '',
      render: (_, row) => (
        <button onClick={e => { e.stopPropagation(); handleToggleActive(row); }} className={`text-xs ${row.active ? 'text-muted hover:text-danger' : 'text-accent hover:underline'}`}>
          {row.active ? 'Disable' : 'Enable'}
        </button>
      ),
    },
  ];

  const firingColumns = [
    { key: 'alertName', header: 'Alert', render: (v, row) => v || row.alert?.name || '—' },
    { key: 'value', header: 'Value', render: v => <span className="tabular-nums">{v ?? '—'}</span> },
    { key: 'resolvedAt', header: 'Status', render: v => <StatusBadge status={v ? 'ACTIVE' : 'FAILED'} variant={v ? 'badge-success' : 'badge-warning'} /> },
    { key: 'createdAt', header: 'Fired at', render: v => v ? new Date(v).toLocaleString() : '—', cellClassName: 'cell-muted' },
    {
      key: 'actions', header: '',
      render: (_, row) => !row.resolvedAt ? (
        <button onClick={e => { e.stopPropagation(); setResolveConfirm(row.id); }} className="text-xs btn-secondary">Resolve</button>
      ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Manage alert rules and view firings"
        action={<button className="btn-primary" onClick={() => setShowForm(true)}>New rule</button>}
      />

      <div className="tab-list mb-4">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab ${activeTab === tab ? 'tab-active' : ''}`}>{tab}</button>
        ))}
      </div>

      {error && <div className="card p-4 mb-4 text-sm text-danger">{error}</div>}

      {activeTab === 'Rules' && (
        <div className="card">
          <DataTable
            columns={ruleColumns}
            data={rules}
            loading={loading}
            emptyState={
              <EmptyState icon={AlertTriangle} title="No alert rules" description="Create rules to get notified about important events."
                action={<button className="btn-primary" onClick={() => setShowForm(true)}>New rule</button>} />
            }
          />
        </div>
      )}

      {activeTab === 'Firings' && (
        <div className="card">
          <DataTable
            columns={firingColumns}
            data={firings}
            loading={firingsLoading}
            emptyState={<EmptyState icon={AlertTriangle} title="No firings" description="Alert firings will appear here when rules are triggered." />}
          />
        </div>
      )}

      <Drawer open={showForm} onClose={() => { setShowForm(false); setFormError(null); }} title="Create alert rule">
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="label">Rule name</label>
            <input type="text" name="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. High payment failures" className="input" autoFocus />
          </div>
          <div>
            <label className="label">Metric</label>
            <select name="metric" value={form.metric} onChange={e => setForm(p => ({ ...p, metric: e.target.value }))} className="select">
              {METRIC_OPTIONS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Operator</label>
              <select name="operator" value={form.operator} onChange={e => setForm(p => ({ ...p, operator: e.target.value }))} className="select">
                {OPERATOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Threshold</label>
              <input type="number" step="any" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} placeholder="e.g. 5" className="input" />
            </div>
          </div>
          {formError && <div className="text-sm text-danger bg-danger-muted border border-danger/20 rounded-md px-4 py-3">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">{submitting ? 'Creating…' : 'Create rule'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        open={!!resolveConfirm}
        onClose={() => setResolveConfirm(null)}
        onConfirm={handleResolve}
        loading={resolving}
        title="Resolve firing"
        description="Mark this alert firing as resolved?"
        confirmLabel="Resolve"
        confirmVariant="btn-primary"
      />
    </>
  );
}
