# Module 3 — Billing (Subscriptions, Invoices, Payments)

Module 3 adds the three Billing tabs to the Llah mobile app, each with a
list screen, a detail screen, an API client, and a stack navigator, and
rewires `AppNavigator` to a six-tab layout with the Developer tab removed.

## What was built

### API clients (`src/api/`)
- `subscriptions.js` — `getSubscriptions`, `getSubscription`, `cancelSubscription`
  (`POST /subscriptions/:id/cancel` with `{ immediate }` body).
- `invoices.js` — `getInvoices`, `getInvoice`, `finalizeInvoice`
  (`POST /invoices/:id/finalize`), `voidInvoice` (`POST /invoices/:id/void`).
- `payments.js` — `getPayments`, `getPayment`.

All use `apiRequest` from `./client` with `{ token, orgId }`. The `status`
query param is only appended when non-empty.

### Screens
- `subscriptions/SubscriptionsScreen.jsx` — All/Active/Canceled filter tabs,
  status-dot badges, per-period amount summed from `plan.items`, 6-row
  loading skeleton, error/empty states, pull-to-refresh.
- `subscriptions/SubscriptionDetailScreen.jsx` — header card (status badge,
  customer, plan, period dates), Billing + Activity `SectionCard`s,
  ACTIVE-only "Cancel subscription" button with `Alert.alert` confirm.
- `invoices/InvoicesScreen.jsx` — All/Draft/Open/Paid/Void filter tabs, mono
  invoice number, amount + status badge, skeleton/error/empty states.
- `invoices/InvoiceDetailScreen.jsx` — header card (mono number, status,
  total), Details + Line items `FlatList` + Totals sections, Finalize
  (DRAFT) / Void (OPEN) actions with `Alert.alert` confirms.
- `payments/PaymentsScreen.jsx` — All/Pending/Succeeded/Failed filter tabs,
  large tabular amount + status badge, invoice id in muted mono.
- `payments/PaymentDetailScreen.jsx` — header card (amount, status,
  provider) + Details section with mono IDs.

### Navigators (`src/navigation/`)
- `SubscriptionsNavigator.jsx`, `InvoicesNavigator.jsx`,
  `PaymentsNavigator.jsx` — each a `createNativeStackNavigator` with
  `headerShown: false`, replicating `CustomersNavigator`.
- `AppNavigator.jsx` — six-tab order Home, Customers, Subscriptions,
  Invoices, Payments, Settings. Developer tab removed. New tabs use
  RefreshCw / Receipt / CreditCard icons. Tab icon stroke aligned to 1.5.

## Status badge variants
ACTIVE / PAID / SUCCEEDED → `success`; OPEN → `info`; PENDING / DRAFT →
`warning`; PAST_DUE / FAILED / UNCOLLECTIBLE → `danger`; CANCELED / VOID →
`neutral`.

## Review-fix pass
Applied to address the Module 3 review findings:
- **Destructive mutations no longer fail silently.** `cancelSubscription`,
  `finalizeInvoice`, and `voidInvoice` mutations now each define an
  `onError` that surfaces the failure via `Alert.alert` (the existing
  alert-driven interaction model), so a failed billing state change is
  never silent.
- **Tab bar stroke.** `AppNavigator` tab icons now render at `strokeWidth=1.5`
  per the design rule; the accessibility props (`accessibilityRole`/
  `accessibilityState`/`accessibilityLabel`) were kept.
- **Orphaned screen.** `DeveloperScreen.jsx` (no longer imported after the
  Developer tab was removed) was deleted.
- **postinstall patch documented.** `scripts/strip-image-background.js`
  now carries a header comment documenting what it patches, why, the
  targeted `react-native-css-interop` version, and the upgrade-time
  re-validation steps (no new packages introduced).

## Palette decision
The Module 3 spec's "DESIGN RULES" list a palette
(`#f8fafc / #0ea5e9 / #0f172a / #ef4444 / #16a34a / #d97706`) that is
**inconsistent** with the Module 1/2 reference screens the same spec says to
replicate, which — and the rest of the live app — use the dashboard-aligned
palette (`#f6f9fc / #3d4ed7 / #0a2540 / #c41e3a / #0d9488 / #6b7c93 /
#e3e8ee`). That dashboard palette is already the project's committed,
pushed direction.

Resolution: **accept the dashboard-aligned palette as canonical.** The
Module 3 screens use it and are consistent with the rest of the app. We did
**not** re-palette only the six new screens (which would fragment the UI),
nor revert the whole app (a destructive, app-wide change). If the spec's
hex set is to become canonical, that is an app-wide re-skin that should be
landed as its own change, not inside the Module 3 diff.

## Verification
- `@babel/core` transpile (with the project's `babel-preset-expo` +
  `nativewind/babel` config) succeeds on the three changed JSX files
  (`SubscriptionDetailScreen`, `InvoiceDetailScreen`, `AppNavigator`).
- `node --check` succeeds on the patched `strip-image-background.js`.
- Confirmed `AppNavigator` imports all three new navigators and the tab
  order is Home / Customers / Subscriptions / Invoices / Payments / Settings.
- No new packages were added to `apps/mobile/package.json`.
