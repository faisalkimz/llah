import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, friendlyError } from '../lib/api.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AuthVisualRecovery from '../components/auth/AuthVisualRecovery.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const data = await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      setSuccess(true);
      if (data.token) {
        setResetToken(data.token);
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthLayout
        brandHeadline="Check your inbox"
        brandSubtitle="We've sent password reset instructions to your email if an account exists."
        brandVisual={<AuthVisualRecovery variant="forgot" />}
        brandFooter="Didn't receive the email? Check your spam folder"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
            <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-2">Check your email</h2>
          <p className="text-[14px] text-muted mb-8">
            If an account exists for <span className="font-semibold text-ink">{email}</span>, 
            we've sent a password reset link.
          </p>

          {resetToken && (
            <div className="mb-8 rounded-xl border border-line bg-canvas p-5 text-left">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted">Development Mode</span>
                <span className="rounded-full bg-ink px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">Dev</span>
              </div>
              <p className="text-[11px] text-muted mb-2">Reset token (for testing):</p>
              <code className="block rounded-lg bg-white border border-line px-3 py-2.5 text-[11px] text-ink break-all font-mono">
                {resetToken}
              </code>
              <Link 
                to={`/reset-password?token=${resetToken}`}
                className="mt-4 block w-full rounded-xl bg-ink px-4 py-2.5 text-center text-[13px] font-bold text-white transition-all hover:bg-ink/90"
              >
                Reset password now
              </Link>
            </div>
          )}

          <Link 
            to="/login"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink hover:text-sky-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      brandHeadline="Don't worry, it happens"
      brandSubtitle="Enter your email and we'll send you instructions to reset your password securely."
      brandVisual={<AuthVisualRecovery variant="forgot" />}
      brandFooter={<span>Remember your password? <Link to="/login" className="text-white hover:underline">Sign in</Link></span>}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-2" id="forgot-heading">
          Reset your password
        </h2>
        <p className="text-[14px] text-muted">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-5" aria-labelledby="forgot-heading">
        <div>
          <label htmlFor="forgot-email" className="block text-[11px] font-semibold text-ink mb-2 uppercase tracking-wider">
            Email address
          </label>
          <input 
            id="forgot-email"
            className="w-full h-11 rounded-xl border border-line bg-white px-4 text-[14px] text-ink placeholder-muted/60 outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10" 
            type="email" 
            placeholder="name@company.com"
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200/60 px-4 py-3 flex items-start gap-2.5" role="alert">
            <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-[13px] text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button 
          type="submit"
          className="w-full h-12 rounded-xl bg-ink px-4 text-[14px] font-bold text-white transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md" 
          disabled={loading}
          id="forgot-submit"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>

        {/* Back to sign in */}
        <div className="text-center">
          <Link 
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:text-sky-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}