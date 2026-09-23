import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import PasswordInput from '../components/PasswordInput.jsx';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx';

export default function Register() {
  const nav = useNavigate();
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api('/auth/register', {
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
              Start billing smarter in minutes
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed mb-8">
              Join thousands of companies automating their usage-based billing with Llah.
            </p>

            {/* Getting Started Illustration */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <svg viewBox="0 0 200 160" className="w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Steps */}
                <g opacity="0.8">
                  {/* Step 1 - Circle */}
                  <circle cx="40" cy="40" r="20" fill="none" stroke="#0ea5e9" strokeWidth="3"/>
                  <text x="40" y="47" textAnchor="middle" fill="#0ea5e9" fontSize="16" fontWeight="bold">1</text>
                  
                  {/* Step 2 - Circle */}
                  <circle cx="100" cy="40" r="20" fill="none" stroke="#0ea5e9" strokeWidth="3"/>
                  <text x="100" y="47" textAnchor="middle" fill="#0ea5e9" fontSize="16" fontWeight="bold">2</text>
                  
                  {/* Step 3 - Circle */}
                  <circle cx="160" cy="40" r="20" fill="none" stroke="#0ea5e9" strokeWidth="3"/>
                  <text x="160" y="47" textAnchor="middle" fill="#0ea5e9" fontSize="16" fontWeight="bold">3</text>
                  
                  {/* Connecting lines */}
                  <line x1="60" y1="40" x2="80" y2="40" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4,4"/>
                  <line x1="120" y1="40" x2="140" y2="40" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4,4"/>
                </g>
                
                {/* Labels */}
                <text x="40" y="80" textAnchor="middle" fill="white" fontSize="9" opacity="0.6">Sign up</text>
                <text x="100" y="80" textAnchor="middle" fill="white" fontSize="9" opacity="0.6">Configure</text>
                <text x="160" y="80" textAnchor="middle" fill="white" fontSize="9" opacity="0.6">Launch</text>
                
                {/* Checkmark */}
                <path d="M 90 120 L 100 130 L 120 105" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Benefits */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-white/80">
                <svg className="h-5 w-5 flex-shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Free 14-day trial, no credit card required</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <svg className="h-5 w-5 flex-shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Set up in under 5 minutes</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <svg className="h-5 w-5 flex-shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Cancel anytime, no questions asked</span>
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
              Create your account
            </h2>
            <p className="text-sm text-muted">
              Start managing usage-based billing today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                FULL NAME
              </label>
              <input 
                className="w-full h-11 rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder-muted outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10" 
                type="text" 
                placeholder="Jane Smith"
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                WORK EMAIL
              </label>
              <input 
                className="w-full h-11 rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder-muted outline-none transition-all focus:border-ink focus:ring-2 focus:ring-ink/10" 
                type="email" 
                placeholder="jane@company.com"
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                PASSWORD
              </label>
              <PasswordInput
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 10 characters"
                required
                minLength={10}
                autoComplete="new-password"
                name="new-password"
              />
              <PasswordStrengthMeter password={form.password} />
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-muted">
              By signing up, you agree to our{' '}
              <a href="#" className="text-ink hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-ink hover:underline">Privacy Policy</a>
            </p>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-medium text-muted">OR</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-ink hover:underline"
                >
                  Sign in
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
