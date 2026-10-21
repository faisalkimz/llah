import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';

const PREDEFINED_KEYS = [
  { key: 'billing_currency', label: 'Billing currency', placeholder: 'e.g. USD' },
  { key: 'invoice_prefix', label: 'Invoice prefix', placeholder: 'e.g. INV-' },
  { key: 'support_email', label: 'Support email', placeholder: 'e.g. support@example.com' },
  { key: 'timezone', label: 'Timezone', placeholder: 'e.g. America/New_York' },
];

function SettingRow({ label, settingKey, initialValue, placeholder, onSave }) {
  const toast = useToast();
  const [value, setValue] = useState(initialValue ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(initialValue ?? ''); }, [initialValue]);

  async function handleSave() {
    try {
      setSaving(true);
      const err = await onSave(settingKey, value);
      if (err) {
        toast.error(err);
      } else {
        toast.success('Setting saved');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-line last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-muted font-mono mt-0.5">{settingKey}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder || ''}
          className="input w-56"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-secondary disabled:opacity-50 whitespace-nowrap"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const toast = useToast();
  const [settingsMap, setSettingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customKeys, setCustomKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [addError, setAddError] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const res = await api('/settings');
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data : (res.data?.settings || []);
        const map = {};
        raw.forEach(item => { if (item.key) map[item.key] = item.value ?? ''; });
        setSettingsMap(map);
        const predefinedKeyNames = PREDEFINED_KEYS.map(k => k.key);
        setCustomKeys(Object.keys(map).filter(k => !predefinedKeyNames.includes(k)));
      } else {
        setError(res.error?.message || 'Failed to load settings');
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function saveSetting(key, value) {
    const res = await api(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
    if (res.success) {
      setSettingsMap(prev => ({ ...prev, [key]: value }));
      return null;
    }
    return res.error?.message || 'Failed to save';
  }

  async function handleAddCustom(e) {
    e.preventDefault();
    if (!newKey.trim()) { setAddError('Key is required'); return; }
    try {
      setAddSaving(true);
      setAddError('');
      const res = await api(`/settings/${newKey.trim()}`, { method: 'PUT', body: JSON.stringify({ value: newValue.trim() }) });
      if (res.success) {
        const k = newKey.trim();
        setSettingsMap(prev => ({ ...prev, [k]: newValue.trim() }));
        if (!PREDEFINED_KEYS.some(p => p.key === k) && !customKeys.includes(k)) {
          setCustomKeys(prev => [...prev, k]);
        }
        setNewKey(''); setNewValue('');
        toast.success('Setting added');
      } else {
        setAddError(res.error?.message || 'Failed to add setting');
      }
    } catch (e) {
      setAddError(e.message || 'An error occurred');
    } finally {
      setAddSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Configure platform-wide settings" />

      {loading && <SkeletonTable rows={4} columns={2} className="mb-6" />}

      {error && !loading && (
        <div className="card p-4 mb-6 border-danger/30 text-sm text-danger">
          {error} <button onClick={loadSettings} className="ml-3 underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Predefined settings */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-ink">General</h2>
            </div>
            <div className="px-5">
              {PREDEFINED_KEYS.map(({ key, label, placeholder }) => (
                <SettingRow
                  key={key}
                  settingKey={key}
                  label={label}
                  placeholder={placeholder}
                  initialValue={settingsMap[key]}
                  onSave={saveSetting}
                />
              ))}
            </div>
          </div>

          {/* Custom settings */}
          {customKeys.length > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-ink">Additional settings</h2>
              </div>
              <div className="px-5">
                {customKeys.map(k => (
                  <SettingRow
                    key={k}
                    settingKey={k}
                    label={k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    initialValue={settingsMap[k]}
                    onSave={saveSetting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add custom */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-ink">Add custom setting</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddCustom} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="label">Key</label>
                  <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="e.g. my_custom_key" className="input w-48" />
                </div>
                <div>
                  <label className="label">Value</label>
                  <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Setting value" className="input w-56" />
                </div>
                <button type="submit" disabled={addSaving} className="btn-primary disabled:opacity-50">{addSaving ? 'Adding…' : 'Add setting'}</button>
                {addError && <span className="text-sm text-danger">{addError}</span>}
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
