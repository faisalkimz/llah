import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Sessions from './pages/Sessions.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Usage from './pages/Usage.jsx';
import Revenue from './pages/Revenue.jsx';
import Customers from './pages/Customers.jsx';
import CreateCustomer from './pages/CreateCustomer.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import Meters from './pages/Meters.jsx';
import CreateMeter from './pages/CreateMeter.jsx';
import MeterDetail from './pages/MeterDetail.jsx';
import Products from './pages/Products.jsx';
import Pricing from './pages/Pricing.jsx';
import Plans from './pages/Plans.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Credits from './pages/Credits.jsx';
import ApiKeys from './pages/ApiKeys.jsx';
import Events from './pages/Events.jsx';
import Webhooks from './pages/Webhooks.jsx';
import Developer from './pages/Developer.jsx';
import Team from './pages/Team.jsx';
import Audit from './pages/Audit.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';
import Organizations from './pages/Organizations.jsx';
import CreateOrganization from './pages/CreateOrganization.jsx';
import OrganizationSettings from './pages/OrganizationSettings.jsx';

const appPages = [
  ['/dashboard', Dashboard],
  ['/organizations', Organizations],
  ['/organizations/new', CreateOrganization],
  ['/organizations/:id', OrganizationSettings],
  ['/usage', Usage],
  ['/revenue', Revenue],
  ['/customers', Customers],
  ['/customers/new', CreateCustomer],
  ['/customers/:id', CustomerDetail],
  ['/meters', Meters],
  ['/meters/new', CreateMeter],
  ['/meters/:id', MeterDetail],
  ['/products', Products],
  ['/pricing', Pricing],
  ['/plans', Plans],
  ['/subscriptions', Subscriptions],
  ['/invoices', Invoices],
  ['/payments', Payments],
  ['/credits', Credits],
  ['/api-keys', ApiKeys],
  ['/events', Events],
  ['/webhooks', Webhooks],
  ['/developer', Developer],
  ['/team', Team],
  ['/audit', Audit],
  ['/settings', Settings],
  ['/admin', Admin],
  ['/sessions', Sessions],
  ['/verify-email', VerifyEmail]
];

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: appPages.map(([path, Component]) => ({
      path,
      element: <Component />
    }))
  }
]);
