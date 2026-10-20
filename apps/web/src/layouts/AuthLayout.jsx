import { Link } from 'react-router-dom';
import FloatingParticles from '../components/FloatingParticles.jsx';

/**
 * AuthLayout: Shared split-screen shell for all authentication pages.
 *
 * Props:
 *   brandHeadline   – Large heading for the left panel
 *   brandSubtitle   – Supporting copy below the heading
 *   brandVisual     – React node rendered as the main visual
 *   brandFooter     – Small text at the bottom of the left panel
 *   children        – The right-side form content
 */
export default function AuthLayout({
  brandHeadline,
  brandSubtitle,
  brandVisual,
  brandFooter = 'Metered billing for modern software',
  children,
}) {
  return (
    <div className="flex min-h-screen">
      {/* ═══ LEFT PANEL: Brand + Visual ═══ */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden">
        {/* Light blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdfa]"></div>

        {/* Floating particles */}
        <FloatingParticles count={40} />

        {/* Subtle gradient accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-sky-400/[0.08] rounded-full blur-[100px]" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-cyan-400/[0.06] rounded-full blur-[80px]" aria-hidden="true"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-ink group" id="auth-logo">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-[12px] font-extrabold text-white transition-transform group-hover:scale-105 shadow-sm">
              L
            </div>
            <span className="text-[16px] font-bold tracking-tight">Llah</span>
          </Link>

          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center py-8 max-w-lg">
            <h1 className="text-[28px] xl:text-[34px] font-extrabold text-ink leading-[1.15] tracking-tight mb-3">
              {brandHeadline}
            </h1>
            <p className="text-[14px] xl:text-[15px] text-muted leading-relaxed mb-8 max-w-md">
              {brandSubtitle}
            </p>

            {/* Visual */}
            <div className="w-full">
              {brandVisual}
            </div>
          </div>

          {/* Footer */}
          <div className="text-[11px] text-muted font-medium">
            {brandFooter}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL: Form ═══ */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-6 pb-2">
          <Link to="/" className="inline-flex items-center gap-2.5 text-ink" id="auth-logo-mobile">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-ink to-neutral-700 text-[10px] font-extrabold text-white shadow-sm">
              L
            </div>
            <span className="text-[15px] font-bold tracking-tight text-ink">Llah</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>

        {/* Footer links */}
        <div className="px-6 pb-6 sm:px-10">
          <div className="flex items-center justify-center gap-5 text-[12px] text-muted">
            <Link to="/" className="hover:text-ink transition-colors" id="auth-back-home">
              Back to home
            </Link>
            <span className="text-line">·</span>
            <Link to="/privacy" className="hover:text-ink transition-colors">
              Privacy
            </Link>
            <span className="text-line">·</span>
            <Link to="/terms" className="hover:text-ink transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
