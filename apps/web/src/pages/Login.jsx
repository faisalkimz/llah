import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api, friendlyError } from '../lib/api.js';
import PasswordInput from '../components/PasswordInput.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AuthVisualLogin from '../components/auth/AuthVisualLogin.jsx';

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
      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      if (!response.success) {
        setError(response.error.message);
        setLoading(false);
        return;
      }

      const { user, tokens } = response.data;
      
      // Decode JWT to get user info
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      
      authLogin(tokens, {
        id: payload.sub,
        email: payload.email,
        name: user.name,
        emailVerified: payload.emailVerified || false
      });
      
      nav('/dashboard');
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      brandHeadline="Welcome back to your billing command center"
      brandSubtitle="Track usage, automate invoicing, and manage revenue. Pick up right where you left off."
      brandVisual={<AuthVisualLogin />}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-2" id="login-heading">
          Sign in to your account
        </h2>
        <p className="text-[14px] text-muted">
          Enter your credentials to access your dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-5" aria-labelledby="login-heading">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-[11px] font-semibold text-ink mb-2 uppercase tracking-wider">
            Email address
          </label>
          <input 
            id="login-email"
            className="w-full h-11 rounded-xl border border-line bg-white px-4 text-[14px] text-ink placeholder-muted/60 outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10" 
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
            <label htmlFor="login-password" className="block text-[11px] font-semibold text-ink uppercase tracking-wider">
              Password
            </label>
            <Link 
              to="/forgot-password"
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition-colors"
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
          id="login-submit"
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
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[11px] font-semibold text-muted uppercase tracking-wider">or</span>
          </div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-[13px] text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-ink hover:text-sky-600 transition-colors" id="login-register-link">
              Sign up for free
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
