import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import PasswordInput from '../components/PasswordInput.jsx';

export default function Login() {
  const nav = useNavigate();
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      // Decode JWT to get user info
      const payload = JSON.parse(atob(data.tokens.accessToken.split('.')[1]));
      
      authLogin(data.tokens, {
        id: payload.sub,
        email: payload.email,
        emailVerified: payload.emailVerified || false
      });
      
      nav('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-neutral-900"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-ink transition-transform group-hover:scale-105">
              L
            </div>
            <span className="text-lg font-semibold">Llah</span>
          </Link>

          {/* Main Message & Illustration */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Welcome back to your billing command center
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed mb-8">
              Track usage, automate invoicing, and manage revenue in real-time.
            </p>

            {/* Login Illustration */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <svg viewBox="0 0 200 160" className="w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Dashboard Card */}
                <rect x="20" y="20" width="160" height="120" rx="8" fill="white" opacity="0.1"/>
                
                {/* Chart bars */}
                <rect x="35" y="90" width="12" height="35" rx="2" fill="#0ea5e9" opacity="0.8"/>
                <rect x="52" y="75" width="12" height="50" rx="2" fill="#0ea5e9" opacity="0.9"/>
                <rect x="69" y="80" width="12" height="45" rx="2" fill="#0ea5e9" opacity="0.8"/>
                <rect x="86" y="60" width="12" height="65" rx="2" fill="#0ea5e9"/>
                <rect x="103" y="70" width="12" height="55" rx="2" fill="#0ea5e9" opacity="0.9"/>
                <rect x="120" y="55" width="12" height="70" rx="2" fill="#0ea5e9"/>
                <rect x="137" y="65" width="12" height="60" rx="2" fill="#0ea5e9" opacity="0.8"/>
                
                {/* User avatar */}
                <circle cx="155" cy="40" r="8" fill="white" opacity="0.3"/>
                
                {/* Stats lines */}
                <line x1="35" y1="50" x2="80" y2="50" stroke="white" strokeWidth="2" opacity="0.2"/>
                <line x1="35" y1="58" x2="95" y2="58" stroke="white" strokeWidth="2" opacity="0.2"/>
              </svg>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-white">$2.4B+</div>
                <div className="text-xs text-neutral-400 mt-1">Processed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1.2B+</div>
                <div className="text-xs text-neutral-400 mt-1">Events/day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.99%</div>
                <div className="text-xs text-neutral-400 mt-1">Uptime</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-neutral-400">
            Trusted by leading SaaS, AI, and API companies worldwide
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-ink">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
                L
              </div>
              <span className="text-lg font-semibold">Llah</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-2">
              Sign in to your account
            </h2>
            <p className="text-sm text-muted">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                EMAIL ADDRESS
              </label>
              <input 
                className="w-full h-11 rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder-muted outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10" 
                type="email" 
                placeholder="name@company.com"
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-ink">
                  PASSWORD
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-xs font-medium text-ink hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-danger/5 border border-danger/20 px-4 py-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Submit Button */}
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-medium text-muted">OR</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-muted">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-ink hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>

          {/* Footer Links */}
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
