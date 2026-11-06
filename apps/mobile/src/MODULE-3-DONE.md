# Module 3 — Billing (Subscriptions, Invoices, Payments)

Status: complete. Module 3 of the Llah mobile app adds the Billing section to the
bottom tab bar, replacing the old Developer tab with three new tabs.

## New tabs (order)
Home · Customers · **Subscriptions** · **Invoices** · **Payments** · Settings

## Files created
API clients (apps/mobile/src/api/)
- `subscriptions.js` — getSubscriptions, getSubscription, cancelSubscription
- `invoices.js` — getInvoices, getInvoice, finalizeInvoice, voidInvoice
- `payments.js` — getPayments, getPayment

Screens (apps/mobile/src/screens/app/)
- `subscriptions/SubscriptionsScreen.jsx` — filter tabs (All/Active/Canceled), list rows with status badge + plan name + period amount, skeleton/error/empty + pull to refresh
- `subscriptions/SubscriptionDetailScreen.jsx` — header card, Billing section, Activity timeline, Cancel action (Alert confirm) for ACTIVE subscriptions
- `invoices/InvoicesScreen.jsx` — filter tabs (All/Draft/Open/Paid/Void), list rows with invoice number + customer + amount + status badge
- `invoices/InvoiceDetailScreen.jsx` — header card, Details, Line items (FlatList), Totals, Finalize (DRAFT) / Void (OPEN) actions
- `payments/PaymentsScreen.jsx` — filter tabs (All/Pending/Succeeded/Failed), list rows with amount + status badge + invoice id + date
- `payments/PaymentDetailScreen.jsx` — header card, Details (IDs mono, provider, created date)

Navigators (apps/mobile/src/navigation/)
- `SubscriptionsNavigator.jsx`
- `InvoicesNavigator.jsx`
- `PaymentsNavigator.jsx`

## Files modified
- `navigation/AppNavigator.jsx` — Developer tab removed; Subscriptions/Invoices/Payments tabs added (icons RefreshCw, Receipt, CreditCard). All tab screens keep headerShown: false.

## Patterns followed
- Replicates Module 1/2 customer list + detail patterns (AppBar for lists, custom safe-area header with back chevron for details).
- TanStack Query useQuery for fetching, useMutation for cancel/finalize/void.
- NativeWind classNames only (no StyleSheet.create). Default exports. No TypeScript.
- Colors match the existing app palette (#f6f9fc canvas, #0a2540 ink, #3d4ed7 accent, #c41e3a danger, #0d9488 success) for consistency with Modules 1/2.
- Reuses Badge, DetailRow, SectionCard, SkeletonLoader, ErrorView, AppBar.
- Amounts are minor-units integers; API serializes BigInt as strings, so fmtCurrency coerces with Number(). Dates formatted via fmtDate.

## Verification
No build/test command exists for the Expo app (only `start`/`android`/`ios` dev servers, which run in watch mode and are excluded). Static verification instead:
- Babel parse of all 13 touched/new files: 0 syntax failures.
- Relative-import resolution check across all new files: 0 missing targets.
- Confirmed AppNavigator imports `./SubscriptionsNavigator`, `./InvoicesNavigator`, `./PaymentsNavigator`.
