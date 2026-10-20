import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PageHeader from '../components/ui/PageHeader.jsx';

const PREDEFINED_KEYS = [
  { key: 'billing_currency', label: 'Billing Currency', placeholder: 'e.g. USD' },
  { key: 'invoice_prefix', label: 'Invoice Prefix', placeholder: 'e.g. INV-' },
  { key: 'support_email', label: 'Support Email', placeholder: 'e.g. support@example.com' },
  { key: 'timezone', label: 'Timezone', placeholder: 'e.g. America/New_York' },
];

function SettingCard({ label, settingKey, initialValue, onSave }) {
  const [value, setValue] = useState(initialValue ?? '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [statusMsg, setStatusMsg] = useState('');

  // Sync if parent value changes (initial load)
  useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  async function handleSave() {
    try {
      setSaving(true);
      setStatus(null);
      const err = await onSave(settingKey, value);
      if (err) {
        setStatus('error');
        setStatusMsg(err);
      } else {
        setStatus('success');
        setStatusMsg('Saved');
        setTimeout(() => setStatus(null), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="llah-card p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink mb-1">{label}</div>
        <div className="text-xs text-muted font-mono">{settingKey}</div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={PREDEFINED_KEYS.find(k => k.key === settingKey)?.placeholder || ''}
          className="w-56 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-ink text-white text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {status === 'success' && (
          <span className="text-xs text-green-700 font-medium">{statusMsg}</span>
        )}
        {status === 'error' && (
          <span className="text-xs text-danger font-medium">{statusMsg}</span>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [settingsMap, setSettingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom settings state
  const [customKeys, setCustomKeys] = useState([]); // additional keys from API not in predefined
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [addError, setAddError] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const res = await api('/settings');
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data : (res.data?.settings || []);
        const map = {};
        raw.forEach(item => {
          if (item.key) map[item.key] = item.value ?? '';
        });
        setSettingsMap(map);
        // Collect any keys from API not in predefined list
        const predefinedKeyNames = PREDEFINED_KEYS.map(k => k.key);
        const extra = Object.keys(map).filter(k => !predefinedKeyNames.includes(k));
        setCustomKeys(extra);
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
    const res = await api(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    if (res.success) {
      setSettingsMap(prev => ({ ...prev, [key]: value }));
      return null; // no error
    }
    return res.error?.message || 'Failed to save';
  }

  async function handleAddCustom(e) {
    e.preventDefault();
    if (!newKey.trim()) {
      setAddError('Key is required');
      return;
    }
    try {
      setAddSaving(true);
      setAddError('');
      const res = await api(`/settings/${newKey.trim()}`, {
        method: 'PUT',
        body: JSON.stringify({ value: newValue.trim() }),
      });
      if (res.success) {
        const k = newKey.trim();
        setSettingsMap(prev => ({ ...prev, [k]: newValue.trim() }));
        if (!PREDEFINED_KEYS.some(p => p.key === k) && !customKeys.includes(k)) {
          setCustomKeys(prev => [...prev, k]);
        }
        setNewKey('');
        setNewValue('');
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

      {loading && (
        <div className="llah-card p-8 text-center text-muted">Loading settings…</div>
      )}

      {error && !loading && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
          <button onClick={loadSettings} className="ml-3 underline">Retry</button>
        </div>
      )}

      {!loading && (
        <>
          {/* Predefined settings */}
          <div className="space-y-3 mb-8">
            {PREDEFINED_KEYS.map(({ key, label }) => (
              <SettingCard
                key={key}
                settingKey={key}
                label={label}
                initialValue={settingsMap[key]}
                onSave={saveSetting}
              />
            ))}
          </div>

          {/* Extra keys from API */}
          {customKeys.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Additional Settings</h2>
              {customKeys.map(k => (
                <SettingCard
                  key={k}
                  settingKey={k}
                  label={k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  initialValue={settingsMap[k]}
                  onSave={saveSetting}
                />
              ))}
            </div>
          )}

          {/* Add Custom Setting */}
          <div className="llah-card p-6">
            <h2 className="text-base font-semibold text-ink mb-4">Add Custom Setting</h2>
            <form onSubmit={handleAddCustom} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder="e.g. my_custom_key"
                  className="w-48 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="Setting value"
                  className="w-56 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <button
                type="submit"
                disabled={addSaving}
                className="px-4 py-2 bg-ink text-white text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {addSaving ? 'Adding…' : 'Add'}
              </button>
              {addError && (
                <span className="text-sm text-danger">{addError}</span>
              )}
            </form>
          </div>
        </>
      )}
    </>
  );
}
