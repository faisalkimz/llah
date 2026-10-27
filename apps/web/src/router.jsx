import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';

/* ── Public pages (eagerly loaded) ── */
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Terms from './pages/Terms.jsx';
import Onboarding from './pages/Onboarding.jsx';

/* ── Authenticated pages (lazy-loaded) ── */
const Dashboard            = lazy(() => import('./pages/Dashboard.jsx'));
const Organizations        = lazy(() => import('./pages/Organizations.jsx'));
const CreateOrganization   = lazy(() => import('./pages/CreateOrganization.jsx'));
const OrganizationSettings = lazy(() => import('./pages/OrganizationSettings.jsx'));
const Usage                = lazy(() => import('./pages/Usage.jsx'));
const Revenue              = lazy(() => import('./pages/Revenue.jsx'));
const Customers            = lazy(() => import('./pages/Customers.jsx'));
const CreateCustomer       = lazy(() => import('./pages/CreateCustomer.jsx'));
const CustomerDetail       = lazy(() => import('./pages/CustomerDetail.jsx'));
const Meters               = lazy(() => import('./pages/Meters.jsx'));
const CreateMeter          = lazy(() => import('./pages/CreateMeter.jsx'));
const MeterDetail          = lazy(() => import('./pages/MeterDetail.jsx'));
const Products             = lazy(() => import('./pages/Products.jsx'));
const Pricing              = lazy(() => import('./pages/Pricing.jsx'));
const Plans                = lazy(() => import('./pages/Plans.jsx'));
const Subscriptions        = lazy(() => import('./pages/Subscriptions.jsx'));
const Invoices             = lazy(() => import('./pages/Invoices.jsx'));
const Payments             = lazy(() => import('./pages/Payments.jsx'));
const Credits              = lazy(() => import('./pages/Credits.jsx'));
const ApiKeys              = lazy(() => import('./pages/ApiKeys.jsx'));
const Events               = lazy(() => import('./pages/Events.jsx'));
const Webhooks             = lazy(() => import('./pages/Webhooks.jsx'));
const Developer            = lazy(() => import('./pages/Developer.jsx'));
const Team                 = lazy(() => import('./pages/Team.jsx'));
const Audit                = lazy(() => import('./pages/Audit.jsx'));
const Settings             = lazy(() => import('./pages/Settings.jsx'));
const Admin                = lazy(() => import('./pages/Admin.jsx'));
const BillingPeriods       = lazy(() => import('./pages/BillingPeriods.jsx'));
const Adjustments          = lazy(() => import('./pages/Adjustments.jsx'));
const Refunds              = lazy(() => import('./pages/Refunds.jsx'));
const Coupons              = lazy(() => import('./pages/Coupons.jsx'));
const Tax                  = lazy(() => import('./pages/Tax.jsx'));
const Reports              = lazy(() => import('./pages/Reports.jsx'));
const Alerts               = lazy(() => import('./pages/Alerts.jsx'));
const Notifications        = lazy(() => import('./pages/Notifications.jsx'));
const Jobs                 = lazy(() => import('./pages/Jobs.jsx'));
const Observability        = lazy(() => import('./pages/Observability.jsx'));
const FeatureFlags         = lazy(() => import('./pages/FeatureFlags.jsx'));
const Sessions             = lazy(() => import('./pages/Sessions.jsx'));
const VerifyEmail          = lazy(() => import('./pages/VerifyEmail.jsx'));

/* ── Route-level loading fallback ── */
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-6 w-6 border-2 border-line border-t-ink rounded-full animate-spin" />
    </div>
  );
}

function SuspensePage({ Component }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const appPages = [
  ['/dashboard',           Dashboard],
  ['/organizations',       Organizations],
  ['/organizations/new',   CreateOrganization],
  ['/organizations/:id',   OrganizationSettings],
  ['/usage',               Usage],
  ['/revenue',             Revenue],
  ['/customers',           Customers],
  ['/customers/new',       CreateCustomer],
  ['/customers/:id',       CustomerDetail],
  ['/meters',              Meters],
  ['/meters/new',          CreateMeter],
  ['/meters/:id',          MeterDetail],
  ['/products',            Products],
  ['/pricing',             Pricing],
  ['/plans',               Plans],
  ['/subscriptions',       Subscriptions],
  ['/invoices',            Invoices],
  ['/payments',            Payments],
  ['/credits',             Credits],
  ['/api-keys',            ApiKeys],
  ['/events',              Events],
  ['/webhooks',            Webhooks],
  ['/developer',           Developer],
  ['/team',                Team],
  ['/audit',               Audit],
  ['/settings',            Settings],
  ['/admin',               Admin],
  ['/billing-periods',     BillingPeriods],
  ['/adjustments',         Adjustments],
  ['/refunds',             Refunds],
  ['/coupons',             Coupons],
  ['/tax',                 Tax],
  ['/reports',             Reports],
  ['/alerts',              Alerts],
  ['/notifications',       Notifications],
  ['/jobs',                Jobs],
  ['/observability',       Observability],
  ['/feature-flags',       FeatureFlags],
  ['/sessions',            Sessions],
  ['/verify-email',        VerifyEmail],
];

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/privacy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <Terms /> },
  { path: '/onboarding', element: <Onboarding /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: appPages.map(([path, Component]) => ({
      path,
      element: <SuspensePage Component={Component} />
    }))
  }
]);
