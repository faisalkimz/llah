import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const METRIC_OPTIONS = [
  'USAGE_AMOUNT',
  'INVOICE_OVERDUE_DAYS',
  'PAYMENT_FAILURE_COUNT',
  'MRR_DROP_PERCENT',
];

const OPERATOR_OPTIONS = ['GT', 'GTE', 'LT', 'LTE'];

const METRIC_BADGE = {
  USAGE_AMOUNT: 'bg-purple-100 text-purple-700',
  INVOICE_OVERDUE_DAYS: 'bg-yellow-100 text-yellow-700',
  PAYMENT_FAILURE_COUNT: 'bg-red-100 text-red-700',
  MRR_DROP_PERCENT: 'bg-orange-100 text-orange-700',
};

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('rules');

  // Rules state
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesError, setRulesError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    metric: METRIC_OPTIONS[0],
    threshold: '',
    operator: OPERATOR_OPTIONS[0],
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [evaluateMsg, setEvaluateMsg] = useState(null);

  // Firings state
  const [firings, setFirings] = useState([]);
  const [firingsLoading, setFiringsLoading] = useState(false);
  const [firingsError, setFiringsError] = useState(null);

  const organizationId = localStorage.getItem('current_organization_id');

  useEffect(() => {
    if (!organizationId) {
      setRulesLoading(false);
      setRulesError('Please select an organization first');
      return;
    }
    fetchRules();
  }, [organizationId]);

  useEffect(() => {
    if (activeTab === 'firings' && organizationId) {
      fetchFirings();
    }
  }, [activeTab, organizationId]);

  const fetchRules = async () => {
    setRulesLoading(true);
    setRulesError(null);
    try {
      const res = await api('/alerts');
      if (res.success) {
        setRules(res.data?.alerts || res.data || []);
      } else {
        setRulesError(res.error?.message || 'Failed to load alert rules');
      }
    } catch (e) {
      setRulesError(e.message || 'An error occurred');
    } finally {
      setRulesLoading(false);
    }
  };

  const fetchFirings = async () => {
    setFiringsLoading(true);
    setFiringsError(null);
    try {
      const res = await api('/alerts/firings?limit=20');
      if (res.success) {
        setFirings(res.data?.firings || res.data || []);
      } else {
        setFiringsError(res.error?.message || 'Failed to load firings');
      }
    } catch (e) {
      setFiringsError(e.message || 'An error occurred');
    } finally {
      setFiringsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api('/alerts', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          metric: form.metric,
          threshold: Number(form.threshold),
          operator: form.operator,
        }),
      });
      if (res.success) {
        setShowForm(false);
        setForm({ name: '', metric: METRIC_OPTIONS[0], threshold: '', operator: OPERATOR_OPTIONS[0] });
        await fetchRules();
      } else {
        setFormError(res.error?.message || 'Failed to create alert rule');
      }
    } catch (e) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this alert rule?')) return;
    try {
      const res = await api(`/alerts/${id}`, { method: 'DELETE' });
      if (res.success) {
        await fetchRules();
      }
    } catch (e) {
      // silently ignore
    }
  };

  const handleEvaluate = async () => {
    setEvaluateMsg(null);
    try {
      const res = await api('/alerts/evaluate', { method: 'POST' });
      if (res.success) {
        setEvaluateMsg('Evaluation triggered successfully.');
      } else {
        setEvaluateMsg(res.error?.message || 'Evaluation failed.');
      }
    } catch (e) {
      setEvaluateMsg('Evaluation failed.');
    }
    setTimeout(() => setEvaluateMsg(null), 4000);
  };

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Configure alert rules and view recent firings"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {['rules', 'firings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-ink text-ink'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
            >
              {showForm ? 'Cancel' : '+ New Alert'}
            </button>
            <button
              onClick={handleEvaluate}
              className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted/10 transition-colors"
            >
              Evaluate Now
            </button>
            {evaluateMsg && (
              <span className="text-sm text-green-700">{evaluateMsg}</span>
            )}
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="llah-card p-4 mb-4">
              <h2 className="text-sm font-semibold mb-3">New Alert Rule</h2>
              <form onSubmit={handleCreateRule} className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    className="input"
                    placeholder="Alert name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Metric</label>
                  <select
                    name="metric"
                    value={form.metric}
                    onChange={handleFormChange}
                    className="input"
                    required
                  >
                    {METRIC_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Operator</label>
                  <select
                    name="operator"
                    value={form.operator}
                    onChange={handleFormChange}
                    className="input"
                    required
                  >
                    {OPERATOR_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Threshold</label>
                  <input
                    type="number"
                    name="threshold"
                    value={form.threshold}
                    onChange={handleFormChange}
                    className="input w-28"
                    placeholder="0"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving…' : 'Create'}
                </button>
              </form>
              {formError && (
                <p className="mt-2 text-xs text-red-600">{formError}</p>
              )}
            </div>
          )}

          <div className="llah-card">
            {rulesLoading && (
              <div className="p-8 text-center text-muted">Loading alert rules…</div>
            )}
            {rulesError && !rulesLoading && (
              <div className="p-8 text-center text-red-600">{rulesError}</div>
            )}
            {!rulesLoading && !rulesError && rules.length === 0 && (
              <div className="p-8 text-center text-muted">
                No alert rules yet. Create one above.
              </div>
            )}
            {!rulesLoading && !rulesError && rules.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Metric</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Operator</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Threshold</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Active</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-t border-border hover:bg-muted/10">
                        <td className="p-3 text-sm font-medium">{rule.name}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                              METRIC_BADGE[rule.metric] || 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {rule.metric?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{rule.operator}</td>
                        <td className="p-3 text-sm text-muted-foreground">{rule.threshold}</td>
                        <td className="p-3 text-sm">
                          {rule.active ? (
                            <span className="text-green-700">✓</span>
                          ) : (
                            <span className="text-muted">✗</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Firings Tab */}
      {activeTab === 'firings' && (
        <div className="llah-card">
          {firingsLoading && (
            <div className="p-8 text-center text-muted">Loading firings…</div>
          )}
          {firingsError && !firingsLoading && (
            <div className="p-8 text-center text-red-600">{firingsError}</div>
          )}
          {!firingsLoading && !firingsError && firings.length === 0 && (
            <div className="p-8 text-center text-muted">No recent firings.</div>
          )}
          {!firingsLoading && !firingsError && firings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Alert Rule</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fired At</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Resolved At</th>
                  </tr>
                </thead>
                <tbody>
                  {firings.map((firing) => (
                    <tr key={firing.id} className="border-t border-border hover:bg-muted/10">
                      <td className="p-3 text-sm font-medium">
                        {firing.alertName || firing.alertRuleId || '—'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {firing.value ?? '—'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {firing.firedAt
                          ? new Date(firing.firedAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {firing.resolvedAt ? (
                          new Date(firing.resolvedAt).toLocaleString()
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
