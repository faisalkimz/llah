import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    // Check for token in URL
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      // Auto-verify if both are present
      autoVerify(emailParam, tokenParam);
    }
  }, [searchParams]);

  async function autoVerify(emailAddr, tokenStr) {
    setLoading(true);
    setError('');

    try {
      await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: emailAddr, token: tokenStr })
      });

      setSuccess(true);
      if (user) {
        updateUser({ emailVerified: true });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function requestVerification(e) {
    e.preventDefault();
    setError('');
    setSendingRequest(true);

    try {
      const data = await api('/auth/verify-email/request', {
        method: 'POST'
      });

      // In development, we get the token back
      if (data.token) {
        setVerificationToken(data.token);
        setEmail(user?.email || '');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingRequest(false);
    }
  }

  async function verifyEmail(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, token })
      });

      setSuccess(true);
      if (user) {
        updateUser({ emailVerified: true });
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
                You're all verified!
              </h1>
              <p className="text-lg text-neutral-300 leading-relaxed">
                Your email has been confirmed. You now have full access to all features.
              </p>
            </div>

            <div className="text-xs text-neutral-400">
              Ready to start building amazing things
            </div>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="lg:hidden mb-8">
              <Link to="/" className="inline-flex items-center gap-2 text-ink">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
                  L
                </div>
                <span className="text-lg font-semibold">Llah</span>
              </Link>
            </div>

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-ink mb-2">Email verified!</h2>
            <p className="text-sm text-muted mb-8">
              Your email <span className="font-medium text-ink">{email}</span> has been successfully verified.
            </p>

            <Link 
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-all hover:bg-ink/90 shadow-sm"
            >
              Go to dashboard →
            </Link>
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
              Verify your email
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed mb-8">
              Confirm your email address to unlock all features and keep your account secure.
            </p>

            {/* Email Verification Illustration */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <svg viewBox="0 0 200 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Envelope */}
                <rect x="30" y="40" width="140" height="90" rx="8" fill="white" opacity="0.1"/>
                <path d="M 30 50 L 100 95 L 170 50" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="30" y1="130" x2="80" y2="95" stroke="#0ea5e9" strokeWidth="2" opacity="0.6"/>
                <line x1="170" y1="130" x2="120" y2="95" stroke="#0ea5e9" strokeWidth="2" opacity="0.6"/>
                
                {/* Checkmark Badge */}
                <circle cx="140" cy="60" r="18" fill="#10b981"/>
                <path d="M 132 60 L 138 66 L 148 54" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="text-xs text-neutral-400">
            Check your inbox for the verification link
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
              Verify your email
            </h2>
            <p className="text-sm text-muted">
              {verificationToken ? 'Enter the verification code below' : 'Request a verification email to get started'}
            </p>
          </div>

          {!verificationToken ? (
            <div className="space-y-5">
              <div className="rounded-lg bg-brand-50 border border-brand-500/20 px-4 py-3">
                <p className="text-sm text-ink">
                  Click the button below to receive a verification email at{' '}
                  <span className="font-medium">{user?.email || 'your email address'}</span>
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-danger/5 border border-danger/20 px-4 py-3">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <button
                onClick={requestVerification}
                disabled={sendingRequest}
                className="w-full h-11 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {sendingRequest ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send verification email'
                )}
              </button>

              <div className="text-center">
                <Link 
                  to="/dashboard"
                  className="text-sm font-medium text-ink hover:underline"
                >
                  Skip for now →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={verifyEmail} className="space-y-5">
              <div className="rounded-lg bg-success/5 border border-success/20 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted">Development Mode</span>
                  <span className="rounded bg-ink px-2 py-0.5 text-xs font-medium text-white">DEV</span>
                </div>
                <p className="text-xs text-muted mb-2">Verification token (for testing):</p>
                <code className="block rounded-lg bg-white border border-line px-3 py-2 text-xs text-ink break-all font-mono">
                  {verificationToken}
                </code>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-2">
                  EMAIL ADDRESS
                </label>
                <input 
                  className="w-full h-11 rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder-muted outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-2">
                  VERIFICATION TOKEN
                </label>
                <input 
                  className="w-full h-11 rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder-muted outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10 font-mono" 
                  type="text" 
                  value={token} 
                  onChange={e => setToken(e.target.value)}
                  required
                  placeholder="Paste token from email"
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
                    Verifying...
                  </span>
                ) : (
                  'Verify email'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-line">
            <div className="flex items-center justify-center gap-6 text-xs text-muted">
              <Link to="/dashboard" className="hover:text-ink transition-colors">
                ← Back to dashboard
              </Link>
              <span>·</span>
              <a href="#" className="hover:text-ink transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
