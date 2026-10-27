import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, friendlyError } from '../lib/api.js';
import {
  Building2, Users, Key, ArrowRight, ArrowLeft, Check, Sparkles,
  Copy, Eye, EyeOff, Rocket
} from 'lucide-react';

const STEPS = [
  { id: 'workspace', label: 'Create workspace', icon: Building2 },
  { id: 'invite', label: 'Invite team', icon: Users },
  { id: 'apikey', label: 'API key', icon: Key },
  { id: 'done', label: 'Ready', icon: Rocket },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentStep;
        const isComplete = idx < currentStep;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-all duration-300 ${
                isComplete
                  ? 'bg-ink border-ink text-white'
                  : isActive
                    ? 'border-ink text-ink bg-canvas-subtle'
                    : 'border-line text-muted bg-surface'
              }`}
            >
              {isComplete ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              )}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 transition-colors duration-300 ${
                idx < currentStep ? 'bg-ink' : 'bg-line'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function WorkspaceStep({ onNext }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 63);
  }

  function handleNameChange(value) {
    setName(value);
    if (!customSlug) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await api('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), slug: slug || generateSlug(name) })
      });

      if (!res.success) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      // Set this as the current organization
      localStorage.setItem('current_organization_id', res.data.id);
      onNext(res.data);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-[22px] font-extrabold text-ink tracking-tight">Name your workspace</h2>
        </div>
        <p className="text-[14px] text-muted leading-relaxed">
          This is where your team will manage billing, customers, and usage data. You can rename it later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="onboard-org-name" className="label">Workspace name</label>
          <input
            id="onboard-org-name"
            type="text"
            className="input h-12 text-base"
            placeholder="Acme Inc."
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="onboard-org-slug" className="label">
            URL slug
            {!customSlug && (
              <button
                type="button"
                className="ml-2 text-xs text-accent hover:underline font-normal"
                onClick={() => setCustomSlug(true)}
              >
                customize
              </button>
            )}
          </label>
          <div className="flex items-center gap-0 border border-line rounded-md overflow-hidden bg-surface">
            <span className="text-sm text-muted px-3 bg-canvas-subtle border-r border-line py-3 select-none whitespace-nowrap">
              llah.app/
            </span>
            <input
              id="onboard-org-slug"
              type="text"
              className="flex-1 px-3 py-3 text-sm text-ink bg-transparent outline-none"
              placeholder="acme-inc"
              value={slug}
              onChange={e => { setCustomSlug(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
              readOnly={!customSlug}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-danger-muted border border-danger/20 px-4 py-3" role="alert">
            <p className="text-[13px] text-danger font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full h-12 text-base font-bold gap-2"
          disabled={loading || !name.trim()}
          id="onboard-create-workspace"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating workspace...
            </span>
          ) : (
            <>
              Create workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function InviteStep({ onNext, onBack, orgId }) {
  const [emails, setEmails] = useState([{ email: '', role: 'DEVELOPER' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invited, setInvited] = useState([]);

  function addRow() {
    setEmails(prev => [...prev, { email: '', role: 'DEVELOPER' }]);
  }

  function updateRow(idx, field, value) {
    setEmails(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }

  function removeRow(idx) {
    setEmails(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleInvite() {
    const validEmails = emails.filter(e => e.email.trim() && e.email.includes('@'));
    if (!validEmails.length) {
      onNext();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = [];
      for (const invite of validEmails) {
        const res = await api(`/organizations/${orgId}/members`, {
          method: 'POST',
          body: JSON.stringify({ email: invite.email.trim(), role: invite.role })
        });
        if (res.success) {
          results.push(invite.email);
        }
      }
      setInvited(results);
      // Brief delay to show success
      setTimeout(() => onNext(), 800);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-2">Invite your team</h2>
        <p className="text-[14px] text-muted leading-relaxed">
          Add team members who need access to billing and usage data. You can always do this later.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {emails.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="email"
              className="input flex-1"
              placeholder="teammate@company.com"
              value={row.email}
              onChange={e => updateRow(idx, 'email', e.target.value)}
            />
            <select
              className="select w-36"
              value={row.role}
              onChange={e => updateRow(idx, 'role', e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="BILLING">Billing</option>
              <option value="DEVELOPER">Developer</option>
              <option value="ANALYST">Analyst</option>
              <option value="VIEWER">Viewer</option>
            </select>
            {emails.length > 1 && (
              <button
                type="button"
                className="btn-icon btn-sm text-muted hover:text-danger"
                onClick={() => removeRow(idx)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="text-sm text-accent hover:underline font-medium mb-6 block"
        onClick={addRow}
      >
        + Add another
      </button>

      {invited.length > 0 && (
        <div className="rounded-lg bg-success-muted border border-success/20 px-4 py-3 mb-4">
          <p className="text-[13px] text-success font-medium">
            ✓ Invited {invited.length} team member{invited.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger-muted border border-danger/20 px-4 py-3 mb-4" role="alert">
          <p className="text-[13px] text-danger font-medium">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-secondary h-12 flex-1 gap-2" type="button">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleInvite}
          className="btn-primary h-12 flex-1 gap-2"
          disabled={loading}
          type="button"
        >
          {loading ? 'Sending...' : emails.some(e => e.email.trim()) ? 'Send invites' : 'Skip for now'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ApiKeyStep({ onNext, onBack, orgId }) {
  const [keyName, setKeyName] = useState('Development');
  const [createdKey, setCreatedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError('');

    try {
      const res = await api('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: keyName.trim() || 'Development' })
      });

      if (!res.success) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      setCreatedKey(res.data);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  function copyKey() {
    if (createdKey?.secretKey) {
      navigator.clipboard.writeText(createdKey.secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-2">Create your first API key</h2>
        <p className="text-[14px] text-muted leading-relaxed">
          You'll use this key to send usage events from your application. Keep it safe — you won't be able to see it again.
        </p>
      </div>

      {!createdKey ? (
        <>
          <div className="mb-6">
            <label htmlFor="onboard-key-name" className="label">Key name</label>
            <input
              id="onboard-key-name"
              type="text"
              className="input h-12"
              placeholder="Development"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
            />
            <p className="label-caption">A label to help you identify this key later</p>
          </div>

          {error && (
            <div className="rounded-lg bg-danger-muted border border-danger/20 px-4 py-3 mb-4" role="alert">
              <p className="text-[13px] text-danger font-medium">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={onBack} className="btn-secondary h-12 flex-1 gap-2" type="button">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleCreate}
              className="btn-primary h-12 flex-1 gap-2"
              disabled={loading}
              type="button"
              id="onboard-create-key"
            >
              {loading ? 'Creating...' : 'Generate API key'}
              <Key className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-line bg-canvas-subtle p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Your API key</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowKey(v => !v)} className="btn-icon btn-sm">
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button onClick={copyKey} className="btn-icon btn-sm">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="font-mono text-sm text-ink bg-surface rounded-lg px-4 py-3 border border-line break-all select-all">
              {showKey ? createdKey.secretKey : '••••••••••••••••••••••••••••••••'}
            </div>
            {copied && (
              <p className="text-xs text-success mt-2 font-medium">✓ Copied to clipboard</p>
            )}
            <p className="text-xs text-warning mt-3 font-medium">
              ⚠ Save this key now. You won't be able to see it again.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Quick start</p>
            <pre className="text-xs text-ink font-mono bg-canvas-subtle rounded-lg p-4 overflow-x-auto border border-line">
{`curl -X POST http://localhost:4000/v1/usage-events \\
  -H "Authorization: Bearer ${createdKey.secretKey?.slice(0, 12)}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "cust_123",
    "meterId": "api_requests",
    "quantity": 1,
    "idempotencyKey": "evt_unique_001"
  }'`}
            </pre>
          </div>

          <button
            onClick={onNext}
            className="btn-primary w-full h-12 text-base font-bold gap-2"
            type="button"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function DoneStep() {
  const nav = useNavigate();

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success-muted border-2 border-success/20 mb-6">
        <Rocket className="h-10 w-10 text-success" strokeWidth={1.5} />
      </div>

      <h2 className="text-[26px] font-extrabold text-ink tracking-tight mb-3">You're all set!</h2>
      <p className="text-[15px] text-muted leading-relaxed mb-8 max-w-md mx-auto">
        Your workspace is ready. Start by creating customers and meters, then send your first usage event.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
        <button
          onClick={() => nav('/customers/new')}
          className="card p-4 text-left hover:border-accent transition-colors cursor-pointer group"
        >
          <Users className="h-5 w-5 text-muted mb-2 group-hover:text-accent transition-colors" strokeWidth={1.5} />
          <div className="text-sm font-semibold text-ink">Add customer</div>
          <div className="text-xs text-muted mt-0.5">Create your first customer</div>
        </button>
        <button
          onClick={() => nav('/meters/new')}
          className="card p-4 text-left hover:border-accent transition-colors cursor-pointer group"
        >
          <Key className="h-5 w-5 text-muted mb-2 group-hover:text-accent transition-colors" strokeWidth={1.5} />
          <div className="text-sm font-semibold text-ink">Create meter</div>
          <div className="text-xs text-muted mt-0.5">Define what to track</div>
        </button>
      </div>

      <button
        onClick={() => nav('/dashboard')}
        className="btn-primary h-12 px-8 text-base font-bold gap-2"
        id="onboard-go-dashboard"
      >
        Go to dashboard
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [org, setOrg] = useState(null);

  function nextStep(data) {
    if (step === 0 && data) setOrg(data);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 0));
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-[12px] font-extrabold text-white">
            L
          </div>
          <span className="text-lg font-bold tracking-tight text-ink">Llah</span>
        </div>

        <StepIndicator currentStep={step} />

        <div className="card-raised p-8">
          {step === 0 && <WorkspaceStep onNext={nextStep} />}
          {step === 1 && <InviteStep onNext={nextStep} onBack={prevStep} orgId={org?.id} />}
          {step === 2 && <ApiKeyStep onNext={nextStep} onBack={prevStep} orgId={org?.id} />}
          {step === 3 && <DoneStep />}
        </div>

        {/* Skip link */}
        {step < 3 && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                if (!org) {
                  // If no org created yet, go to dashboard anyway
                  window.location.href = '/dashboard';
                } else {
                  setStep(3);
                }
              }}
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Skip setup and go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
