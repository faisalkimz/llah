import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import PasswordInput from '../components/PasswordInput.jsx';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx';

export default function ResetPassword() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters.');
      setLoading(false);
      return;
    }

    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      });

      setSuccess(true);
      setTimeout(() => nav('/login'), 3000);
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
                All set!
              </h1>
              <p className="text-lg text-neutral-300 leading-relaxed">
                Your password has been updated successfully. You can now sign in with your new credentials.
              </p>
            </div>

            <div className="text-xs text-neutral-400">
              Redirecting you to sign in...
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-ink mb-2">Password updated!</h2>
            <p className="text-sm text-muted mb-8">
              Your password has been reset successfully. Redirecting to sign in...
            </p>

            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:underline"
            >
              Continue to sign in →
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
              Create a secure password
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed mb-8">
              Choose a strong password to keep your account safe. We recommend at least 10 characters.
            </p>

            {/* Key/Shield Illustration */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <svg viewBox="0 0 200 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Shield */}
                <path d="M 100 20 L 140 35 L 140 70 Q 140 100 100 120 Q 60 100 60 70 L 60 35 Z" 
                      fill="white" opacity="0.1" stroke="#10b981" strokeWidth="2"/>
                
                {/* Key */}
                <circle cx="100" cy="65" r="12" fill="#0ea5e9" opacity="0.8"/>
                <circle cx="100" cy="65" r="6" fill="white"/>
                <rect x="98" y="65" width="4" height="25" rx="1" fill="#0ea5e9" opacity="0.8"/>
                <rect x="96" y="85" width="3" height="3" fill="#0ea5e9" opacity="0.8"/>
                <rect x="96" y="90" width="5" height="3" fill="#0ea5e9" opacity="0.8"/>
                
                {/* Checkmark */}
                <circle cx="130" cy="45" r="10" fill="#10b981" opacity="0.9"/>
                <path d="M 125 45 L 128 48 L 135 41" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="text-xs text-neutral-400">
            Password requirements: minimum 10 characters
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
              Set new password
            </h2>
            <p className="text-sm text-muted">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {!token && (
              <div>
                <label className="block text-xs font-medium text-ink mb-2">
                  RESET TOKEN
                </label>
                <input 
                  className="w-full h-11 rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder-muted outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10 font-mono" 
                  type="text" 
                  placeholder="Paste your reset token"
                  value={token} 
                  onChange={e => setToken(e.target.value)}
                  required
                  autoFocus={!token}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                NEW PASSWORD
              </label>
              <PasswordInput
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 10 characters"
                required
                minLength={10}
                autoComplete="new-password"
                autoFocus={!!token}
                name="new-password"
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                CONFIRM PASSWORD
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={10}
                autoComplete="new-password"
                name="confirm-password"
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
                  Resetting...
                </span>
              ) : (
                'Reset password'
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
