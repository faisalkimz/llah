import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Navigation */}
      <nav className="border-b border-line bg-canvas">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">
                L
              </div>
              <span className="text-sm font-semibold tracking-tight text-ink">Llah</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full px-4 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-neutral-100">
                Sign in
              </Link>
              <Link to="/register" className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <h1 className="text-[32px] font-bold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-[13px] text-muted">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="legal-content mt-10">
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy describes how Llah ("we", "us", or "our") collects, uses, and protects information when you use our metered billing and revenue operations platform (the "Service"). By using the Service, you agree to the practices described in this policy.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator of this Llah instance should update this policy with their specific legal entity name, registered address, and contact details before making it available to end users.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Your name and email address</li>
            <li>A hashed version of your password (we never store passwords in plain text)</li>
            <li>Organization and workspace details you provide</li>
          </ul>

          <h3>Usage Data</h3>
          <p>When you use the Service, we collect:</p>
          <ul>
            <li>Session information, including IP addresses and browser user agent</li>
            <li>Actions performed within the platform, stored in the audit trail</li>
            <li>API request metadata, including timestamps and API key identifiers</li>
          </ul>

          <h3>Customer Billing Data</h3>
          <p>
            The Service processes billing and usage data that you submit through the API on behalf of your customers. This includes usage events, customer records, subscription details, invoices, and payment references.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Authenticate your identity and manage sessions</li>
            <li>Process billing operations you initiate through the platform</li>
            <li>Send account-related notifications, such as email verification</li>
            <li>Maintain audit logs for security and compliance</li>
            <li>Respond to support requests</li>
          </ul>

          <h2>4. Data Storage and Security</h2>
          <p>
            Your data is stored in a PostgreSQL database hosted on Neon. Passwords are hashed using bcrypt. Authentication tokens are signed using JWTs with appropriate expiration periods.
          </p>
          <p>
            We implement security measures including rate limiting, CORS policies, HTTP security headers, and role-based access controls. Session tokens can be revoked individually.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator should specify the data hosting region and any additional security certifications relevant to their deployment.
          </p>

          <h2>5. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with:
          </p>
          <ul>
            <li>Infrastructure providers necessary to operate the Service (database hosting, application hosting)</li>
            <li>Law enforcement or regulatory bodies when required by applicable law</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            Account data is retained for as long as your account is active. Audit log entries and financial ledger records are retained in accordance with applicable financial record-keeping requirements. You may request deletion of your account by contacting us.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator should specify their data retention periods and deletion procedures.
          </p>

          <h2>7. Cookies and Local Storage</h2>
          <p>
            The Service uses browser local storage to maintain authentication tokens for your session. We do not use third-party tracking cookies. No advertising cookies are placed.
          </p>

          <h2>8. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a structured format</li>
            <li>Object to or restrict certain processing</li>
          </ul>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be communicated through the Service or via email to registered account holders.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about this Privacy Policy or to exercise your data rights, contact the operator of this Llah instance.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator should provide a contact email address, physical address, and data protection officer details where applicable.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-line bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[9px] font-bold text-white">L</div>
              <span className="text-[13px] font-semibold text-ink">Llah</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-[13px] font-medium text-ink">Privacy Policy</Link>
              <Link to="/terms" className="text-[13px] text-muted transition-colors hover:text-ink">Terms of Service</Link>
            </div>
            <p className="text-[12px] text-muted">&copy; {new Date().getFullYear()} Llah. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
