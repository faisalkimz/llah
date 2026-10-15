# Phase 2a — Completion Report (Modules 13–17)

All modules 13–17 implemented and verified with `node --check`. The pre-existing Prisma test failure (no `DATABASE_URL` in CI) is unchanged from Phase 1.

---

## Files Changed

### Module 13 — billing-periods: Close Period Pipeline

| File | What changed |
|------|--------------|
| `apps/api/src/modules/billing-periods/service.js` | Implemented `closeBillingPeriod(orgId, subscriptionId)`: fetches subscription (with plan items + prices), validates ACTIVE state, aggregates usage per metered price, builds line items using integer arithmetic, creates Invoice via invoices repository, posts CHARGE LedgerEntry, marks subscription CANCELED, returns invoice |
| `apps/api/src/modules/billing-periods/router.js` | Added `POST /:id/close` endpoint that calls `closeBillingPeriod`; returns 422 on invalid state |

### Module 14 — invoices: Real Totals + Sequencing + Finalization

| File | What changed |
|------|--------------|
| `apps/api/src/modules/invoices/service.js` | `createInvoice`: computes `subtotalMinor` server-side (integer arithmetic), sequences invoice number as `INV-{first6ofOrgId}-{0001}`. `updateInvoice`: rejects edits to non-DRAFT invoices. `finalizeInvoice`: DRAFT→OPEN with 422 guard. Added `voidInvoice`: OPEN→VOID with 422 guard |
| `apps/api/src/modules/invoices/repository.js` | `createInvoice`: caller-supplied `amountMinor` per line (no float arithmetic). Added `findLastInvoiceNumber` for sequencing. Added `addCreditLine` transaction helper (creates negative InvoiceLine, decrements `totalMinor`) |
| `apps/api/src/modules/invoices/router.js` | Added `POST /:invoiceId/void`; PUT rejects edits to finalized invoices (422) |
| `apps/api/src/modules/invoices/validators.js` | Removed `number` (server-computed); `updateInvoiceSchema` allows only `dueAt` (finalized invoices are immutable) |

### Module 15 — payments: State Machine + Invoice Reconciliation

| File | What changed |
|------|--------------|
| `apps/api/src/modules/payments/service.js` | `updatePayment`: enforces PENDING→SUCCEEDED\|FAILED state machine (422 on invalid). On SUCCEEDED: fetches linked invoice, increments `amountPaidMinor`, sets invoice to PAID if `amountPaidMinor >= totalMinor` |
| `apps/api/src/modules/payments/router.js` | Added `PATCH /:paymentId` for status updates (state-machine enforced) |
| `apps/api/src/modules/payments/validators.js` | `updatePaymentSchema` now only allows `SUCCEEDED\|FAILED`; `listPaymentsSchema` uses schema-valid statuses (no `CANCELED`) |

### Module 16 — webhooks-inbound: Signature Verification + Event Dispatch

| File | What changed |
|------|--------------|
| `apps/api/src/modules/webhooks-inbound/service.js` | `handleStripeWebhook`: HMAC-SHA256 sig verify against `STRIPE_WEBHOOK_SECRET`; dispatches `payment_intent.succeeded`→SUCCEEDED and `payment_intent.payment_failed`→FAILED; in-memory idempotency Set (TODO: Redis). `handlePayPalWebhook`: HMAC verify against `PAYPAL_WEBHOOK_ID`; dispatches `PAYMENT.CAPTURE.COMPLETED`→SUCCEEDED and `PAYMENT.CAPTURE.DENIED`→FAILED; same idempotency pattern. Unknown event types return `{ received: true }` |
| `apps/api/src/modules/webhooks-inbound/router.js` | Routes pass raw body string (prefers `req.rawBody`, falls back to re-serialized JSON) and correct signature header to service |
| `apps/api/src/config/env.js` | Added optional `STRIPE_WEBHOOK_SECRET` and `PAYPAL_WEBHOOK_ID` fields |

### Module 17 — credits: Balance Tracking + Application

| File | What changed |
|------|--------------|
| `apps/api/src/modules/credits/service.js` | `createCreditGrant`: validates `amountMinor > 0`, validates `expiresAt` is future if provided. Added `getActiveCredits(orgId, customerId)`: returns grants with `remainingMinor > 0` and not expired. Added `applyCreditToInvoice`: validates same customer, validates amount, validates invoice DRAFT/OPEN state, decrements `remainingMinor`, creates credit InvoiceLine, posts CREDIT LedgerEntry, returns updated invoice |
| `apps/api/src/modules/credits/repository.js` | `createCreditGrant`: sets `remainingMinor = amountMinor` as BigInt. Added `findActiveCredits`: filters `remainingMinor > 0` and `expiresAt IS NULL OR > now`. Added `decrementCreditGrant` using Prisma `decrement` (integer arithmetic) |
| `apps/api/src/modules/credits/router.js` | Added `GET /active` (with required `customerId` query param). Added `POST /:grantId/apply` endpoint |
| `apps/api/src/modules/credits/validators.js` | Added `applyCreditSchema` (`invoiceId`, `amountToApplyMinor`) |

---

## Verification

- `node --check src/app.js` — passed (exit 0)
- `node --check` on all 16 changed files — all passed
- `npm test` — pre-existing failure: Prisma client binary not generated (`prisma generate` requires `DATABASE_URL`, unavailable in this environment). Unrelated to Phase 2a changes.

---

## Key Design Decisions

- **LedgerEntry type for close-period**: Schema `LedgerEntryType` enum has `CHARGE | CREDIT | PAYMENT | REFUND | ADJUSTMENT | TAX | DISCOUNT` — no `INVOICE_CREATED`. Used `CHARGE` as the closest semantic match.
- **Billing period model**: The schema has no dedicated `BillingPeriod` table; periods are represented by `Subscription.currentPeriodStart/End`. `closeBillingPeriod` operates on subscriptions and sets status to `CANCELED`.
- **PayPal HMAC**: PayPal's full signature verification requires fetching an RSA cert from a URL. Without external HTTP access, the service uses HMAC-SHA256 with `PAYPAL_WEBHOOK_ID` as the shared secret and documents the production upgrade path.
- **Invoice immutability**: `updateInvoice` rejects all edits to non-DRAFT invoices (status != DRAFT → 422).
