import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

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
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-neutral-900"></div>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>

          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link to="/" className="flex items-center gap-2 text-white group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-ink transition-transform group-hover:scale-105">
                L
              </div>
              <span className="text-lg font-semibold">Llah</span>
            </Link>

            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Check your inbox
              </h1>
              <p className="text-lg text-neutral-300 leading-relaxed">
                We've sent password reset instructions to your email if an account exists.
              </p>
            </div>

            <div className="text-xs text-neutral-400">
              Didn't receive the email? Check your spam folder
            </div>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-ink">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
                  L
                </div>
                <span className="text-lg font-semibold">Llah</span>
              </Link>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-ink mb-2">Check your email</h2>
              <p className="text-sm text-muted mb-8">
                If an account exists for <span className="font-medium text-ink">{email}</span>, 
                we've sent a password reset link.
              </p>

              {resetToken && (
                <div className="mb-8 rounded-lg border border-line bg-canvas p-6 text-left">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted">Development Mode</span>
                    <span className="rounded bg-ink px-2 py-0.5 text-xs font-medium text-white">DEV</span>
                  </div>
                  <p className="text-xs text-muted mb-2">Reset token (for testing):</p>
                  <code className="block rounded-lg bg-white border border-line px-3 py-2 text-xs text-ink break-all font-mono">
                    {resetToken}
                  </code>
                  <Link 
                    to={`/reset-password?token=${resetToken}`}
                    className="mt-4 block w-full rounded-lg bg-ink px-4 py-2.5 text-center text-sm font-medium text-white transition-all hover:bg-ink/90"
                  >
                    Reset password now →
                  </Link>
                </div>
              )}

              <Link 
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:underline"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-neutral-900"></div>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2 text-white group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-ink transition-transform group-hover:scale-105">
              L
            </div>
            <span className="text-lg font-semibold">Llah</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Don't worry, it happens
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed mb-8">
              Enter your email and we'll send you instructions to reset your password.
            </p>

            {/* Email Illustration */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <svg viewBox="0 0 200 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Envelope */}
                <rect x="30" y="40" width="140" height="90" rx="8" fill="white" opacity="0.1"/>
                <path d="M 30 50 L 100 95 L 170 50" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="30" y1="130" x2="80" y2="95" stroke="#0ea5e9" strokeWidth="2" opacity="0.6"/>
                <line x1="170" y1="130" x2="120" y2="95" stroke="#0ea5e9" strokeWidth="2" opacity="0.6"/>
                
                {/* Lock icon */}
                <circle cx="100" cy="80" r="15" fill="#10b981" opacity="0.8"/>
                <rect x="93" y="78" width="4" height="6" rx="1" fill="white"/>
                <path d="M 95 78 L 95 75 A 5 5 0 0 1 105 75 L 105 78" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>

          <div className="text-xs text-neutral-400">
            Remember your password?{' '}
            <Link to="/login" className="text-white hover:underline">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-ink">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
                L
              </div>
              <span className="text-lg font-semibold">Llah</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-2">
              Reset your password
            </h2>
            <p className="text-sm text-muted">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                EMAIL ADDRESS
              </label>
              <input 
                className="w-full h-11 rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder-muted outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10" 
                type="email" 
                placeholder="name@company.com"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg bg-danger/5 border border-danger/20 px-4 py-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full h-11 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow" 
              disabled={loading}
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

            <div className="text-center">
              <Link 
                to="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to sign in
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-line">
            <div className="flex items-center justify-center gap-6 text-xs text-muted">
              <Link to="/" className="hover:text-ink transition-colors">
                ← Back to home
              </Link>
              <span>·</span>
              <a href="#" className="hover:text-ink transition-colors">
                Privacy
              </a>
              <span>·</span>
              <a href="#" className="hover:text-ink transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}