import { Link } from 'react-router-dom';

export default function Terms() {
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
        <h1 className="text-[32px] font-bold tracking-tight text-ink">Terms of Service</h1>
        <p className="mt-2 text-[13px] text-muted">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="legal-content mt-10">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Llah metered billing and revenue operations platform (the "Service"), you agree to be bound by these Terms of Service. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these terms.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator of this Llah instance should update these terms with their specific legal entity name, jurisdiction, and governing law before making them available to end users.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Llah is a metered billing and revenue operations platform that provides:
          </p>
          <ul>
            <li>Usage event ingestion and aggregation via REST API</li>
            <li>Customer, meter, product, and pricing management</li>
            <li>Subscription and billing period management</li>
            <li>Invoice generation with immutable ledger entries</li>
            <li>Credits, adjustments, and refund processing</li>
            <li>Revenue analytics and reporting</li>
            <li>Webhook delivery and developer tools</li>
            <li>Team collaboration with role-based access control</li>
          </ul>

          <h2>3. Account Registration</h2>
          <p>
            To use the Service, you must create an account with a valid email address and secure password. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
          </p>
          <p>
            You agree to provide accurate information during registration and to update your information if it changes. You must notify us immediately if you become aware of any unauthorized use of your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to the Service or its related systems</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Submit fraudulent, misleading, or inaccurate billing data</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
            <li>Use the Service to process financial data in violation of applicable regulations</li>
          </ul>

          <h2>5. Data Ownership</h2>
          <p>
            You retain ownership of all data you submit to the Service, including customer records, usage events, pricing configurations, and billing data. We do not claim ownership over your content.
          </p>
          <p>
            You grant us a limited license to process, store, and display your data solely to provide the Service to you.
          </p>

          <h2>6. Financial Data Accuracy</h2>
          <p>
            The Service processes billing data on your behalf. While we implement deterministic arithmetic (integer minor units) and append-only ledger entries to maintain accuracy, you are responsible for the correctness of the data you submit, including usage event values, pricing configurations, and customer information.
          </p>
          <p>
            The Service provides tools for corrections through adjustments, credits, and refunds. You are responsible for reconciling billing data with your payment provider.
          </p>

          <h2>7. API Usage</h2>
          <p>
            Access to the Service API is provided through workspace-scoped API keys. You are responsible for securing your API keys. Do not embed API keys in client-side code or public repositories.
          </p>
          <p>
            The Service implements rate limiting. Excessive or abusive API usage may result in temporary throttling or account suspension.
          </p>

          <h2>8. Service Availability</h2>
          <p>
            We aim to provide reliable access to the Service but do not guarantee uninterrupted availability. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator should specify any SLA commitments, maintenance windows, and support response times applicable to their deployment.
          </p>

          <h2>9. Termination</h2>
          <p>
            You may close your account at any time. We may suspend or terminate your access to the Service if you violate these terms or if your use poses a risk to the Service or other users.
          </p>
          <p>
            Upon termination, your right to access the Service ceases. We may retain data as required by applicable law or for legitimate business purposes, such as maintaining financial records.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, the Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator should consult legal counsel to ensure limitation of liability clauses comply with the laws of their jurisdiction.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may modify these Terms of Service at any time. Material changes will be communicated through the Service or via email. Continued use of the Service after changes take effect constitutes acceptance of the updated terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with applicable law.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator should specify the governing law jurisdiction and dispute resolution mechanism.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about these Terms of Service, contact the operator of this Llah instance.
          </p>
          <p>
            <strong className="text-ink">Note:</strong> The operator should provide contact details here.
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
              <Link to="/privacy" className="text-[13px] text-muted transition-colors hover:text-ink">Privacy Policy</Link>
              <Link to="/terms" className="text-[13px] font-medium text-ink">Terms of Service</Link>
            </div>
            <p className="text-[12px] text-muted">&copy; {new Date().getFullYear()} Llah. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
