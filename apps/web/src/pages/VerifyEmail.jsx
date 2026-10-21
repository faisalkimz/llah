import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AuthVisualVerify from '../components/auth/AuthVisualVerify.jsx';

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      autoVerify(emailParam, tokenParam);
    }
  }, [searchParams]);

  async function autoVerify(emailAddr, tokenStr) {
    setLoading(true);
    setError('');
    try {
      const res = await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: emailAddr, token: tokenStr }),
      });
      if (!res.success) throw new Error(res.error?.message || 'Verification failed.');
      setSuccess(true);
      if (user) updateUser({ emailVerified: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function requestVerification(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await api('/auth/verify-email/request', { method: 'POST' });
      if (!res.success) throw new Error(res.error?.message || 'Could not send email.');
      setSent(true);
      if (res.data?.token) {
        setVerificationToken(res.data.token);
        setEmail(user?.email || '');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  async function verifyEmail(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, token }),
      });
      if (!res.success) throw new Error(res.error?.message || 'Invalid or expired token.');
      setSuccess(true);
      if (user) updateUser({ emailVerified: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ────────────────────────────────────────────
  if (success) {
    return (
      <AuthLayout
        brandHeadline="You're all set"
        brandSubtitle="Your email is verified. You now have full access to API keys, webhooks, and billing features."
        brandVisual={<AuthVisualVerify />}
        brandFooter="Metered billing for modern software"
      >
        <div className="text-center" id="verify-success-heading">
          {/* Check icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/60">
            <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-2">
            Email verified
          </h2>
          <p className="text-[14px] text-muted mb-8">
            {email ? (
              <>
                <span className="font-medium text-ink">{email}</span> is confirmed.
                Your account has full access.
              </>
            ) : (
              'Your email address is confirmed. Your account has full access.'
            )}
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 rounded-xl bg-ink px-4 text-[14px] font-bold text-white transition-all hover:bg-ink/90 active:scale-[0.99] shadow-sm hover:shadow-md"
          >
            Go to dashboard
          </button>
        </div>
      </AuthLayout>
    );
  }

  // ── Auto-verifying from URL params ───────────────────────────
  if (loading && searchParams.get('token')) {
    return (
      <AuthLayout
        brandHeadline="Verifying your email"
        brandSubtitle="Hold on while we confirm your address."
        brandVisual={<AuthVisualVerify />}
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 border border-sky-200/60">
            <svg className="animate-spin h-7 w-7 text-sky-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-2">Verifying...</h2>
          <p className="text-[14px] text-muted">Confirming your email address.</p>
          {error && (
            <div className="mt-6 rounded-xl bg-red-50 border border-red-200/60 px-4 py-3 text-left" role="alert">
              <p className="text-[13px] text-red-700 font-medium">{error}</p>
              <button
                onClick={() => { setError(''); setLoading(false); }}
                className="mt-2 text-[12px] font-semibold text-red-600 hover:underline"
              >
                Try manually instead
              </button>
            </div>
          )}
        </div>
      </AuthLayout>
    );
  }

  // ── Main verify email form ───────────────────────────────────
  return (
    <AuthLayout
      brandHeadline="One quick step to secure your account"
      brandSubtitle="Verify your email to unlock API keys, webhooks, and all billing features."
      brandVisual={<AuthVisualVerify />}
      brandFooter="Metered billing for modern software"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-2" id="verify-heading">
          Verify your email
        </h2>
        <p className="text-[14px] text-muted">
          {verificationToken
            ? 'Enter the token below to confirm your address.'
            : 'We\'ll send a verification link to your inbox.'}
        </p>
      </div>

      {/* ── Step 1: Send email ── */}
      {!verificationToken ? (
        <form onSubmit={requestVerification} className="space-y-5" aria-labelledby="verify-heading">
          {/* Recipient info card */}
          <div className="rounded-xl border border-sky-200/40 bg-sky-50/60 px-4 py-3.5 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-sky-100 border border-sky-200/60 flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-sky-700">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-ink/80">Sending to</p>
              <p className="text-[13px] font-medium text-ink truncate">{user?.email || 'your email address'}</p>
            </div>
          </div>

          {sent && !error && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 px-4 py-3 flex items-center gap-2.5" role="status">
              <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[13px] text-emerald-700 font-medium">Email sent. Check your inbox.</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200/60 px-4 py-3 flex items-start gap-2.5" role="alert">
              <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-[13px] text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full h-12 rounded-xl bg-ink px-4 text-[14px] font-bold text-white transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Sending...
              </span>
            ) : sent ? (
              'Resend verification email'
            ) : (
              'Send verification email'
            )}
          </button>

          <div className="text-center">
            <Link
              to="/dashboard"
              className="text-[13px] font-semibold text-muted hover:text-ink transition-colors"
            >
              Skip for now
            </Link>
          </div>
        </form>
      ) : (
        /* ── Step 2: Enter token (dev mode) ── */
        <form onSubmit={verifyEmail} className="space-y-5" aria-labelledby="verify-heading">
          {/* Dev mode token display */}
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Development mode</span>
              <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">DEV</span>
            </div>
            <p className="text-[11px] text-amber-700/80 mb-2">Your verification token (auto-filled in production via email):</p>
            <code className="block rounded-lg bg-white border border-amber-200/60 px-3 py-2 text-[11px] text-ink break-all font-mono leading-relaxed">
              {verificationToken}
            </code>
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="verify-email" className="block text-[11px] font-semibold text-ink mb-2 uppercase tracking-wider">
              Email address
            </label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full h-11 rounded-xl border border-line bg-white px-4 text-[14px] text-ink placeholder-muted/60 outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>

          {/* Token field */}
          <div>
            <label htmlFor="verify-token" className="block text-[11px] font-semibold text-ink mb-2 uppercase tracking-wider">
              Verification token
            </label>
            <input
              id="verify-token"
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              placeholder="Paste your token"
              className="w-full h-11 rounded-xl border border-line bg-white px-4 text-[13px] text-ink font-mono placeholder-muted/60 outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200/60 px-4 py-3 flex items-start gap-2.5" role="alert">
              <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-[13px] text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-ink px-4 text-[14px] font-bold text-white transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Verifying...
              </span>
            ) : (
              'Verify email'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setVerificationToken(''); setSent(false); setError(''); }}
              className="text-[13px] font-semibold text-muted hover:text-ink transition-colors"
            >
              Back
            </button>
          </div>
        </form>
      )}

      {/* Footer links */}
      <div className="mt-8 pt-6 border-t border-line">
        <div className="flex items-center justify-center gap-5 text-[12px] text-muted">
          <Link to="/dashboard" className="hover:text-ink transition-colors">
            Back to dashboard
          </Link>
          <span className="text-line">·</span>
          <a href="mailto:support@llah.io" className="hover:text-ink transition-colors">
            Need help?
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
