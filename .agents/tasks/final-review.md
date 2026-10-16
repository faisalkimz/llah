# Llah Metered-Billing API — Modules 01–20 Implementation Review

Modules 01–20 of the Llah billing API are now fully scaffolded with real service, repository, and router implementations. The core financial pipeline — usage ingestion, invoice creation, payment state machine, refunds, credits, coupons, adjustments, and billing-period close — is in place. The Joi→Zod migration is complete, ESM is clean, and the `{ data: ... }` envelope is consistent across every implemented route. Several structural concerns remain that will cause correctness or security bugs in production.

**Watch for:**
- `applyCreditToInvoice` runs `decrementCreditGrant` and `addCreditLine` in two separate non-atomic calls — a crash between them leaves the credit decremented but the invoice unchanged (confirmed)
- `updatePayment` reconciles the invoice outside a transaction — two concurrent SUCCEEDED transitions for the same invoice can double-count `amountPaidMinor` (confirmed)
- `processRefund` blocks re-processing an already-SUCCEEDED refund but has no guard for a FAILED refund; a FAILED refund can be re-processed to SUCCEEDED (confirmed)
- `verifyStripeSignature` and `verifyPayPalSignature` both return `true` when the respective env secret is absent — there is no production environment guard (confirmed)
- `app.js` wraps `JSON.parse` on the raw webhook body without a try/catch, so a non-JSON Stripe/PayPal payload will crash the raw-body middleware before reaching the router's error handler (confirmed)
- Mixed Prisma import style: a minority of repositories use the named `{ prisma }` export while the majority use the default import — functionally equivalent but inconsistent (confirmed)

**Verdict**: NEEDS_CHANGES

---

## High-level view

The financial arithmetic is solid throughout. All monetary amounts flow as BigInt through the service and repository layers, integer division is explicit (`/ BigInt(100)` for percentage coupons), and `Math.floor(Number(quantity))` is used carefully only for the non-monetary quantity field. No floats touch any `*Minor` column.

The Joi→Zod migration is complete — zero `joi` imports remain across the entire `src` tree. ESM is clean; no `require()` calls anywhere. Prisma import style is nearly uniform (default `import prisma from '../../lib/prisma.js'`) but about a dozen earlier-written repositories still use the named `{ prisma }` export. Both exports resolve to the same singleton instance, so there is no functional difference, but the inconsistency is a maintenance signal.

The `{ data: ... }` envelope is used by every implemented router with three minor deviations: `organizations/router.js` wraps delete/remove-member success as `{ data: { success: true } }` (acceptable), a dead `success()` helper in `api-response.js` still exports `{ success: true, data }` shape (unused in routes but exists), and auth service returns raw `{ success: true }` objects that the auth router should be converting — this is internal and does not leak to clients.

The payment and refund state machines are largely correct. PENDING→SUCCEEDED|FAILED is enforced by both the Zod validator (which rejects any other value in the update schema) and the service-layer transition table. SUCCEEDED→REFUNDED|PARTIALLY_REFUNDED is driven by `processRefund`. The gap is that `processRefund` only blocks re-processing when `existing.status === 'SUCCEEDED'`; it does not block processing a refund that is in `FAILED` state, which means a FAILED refund can be promoted to SUCCEEDED.

Two atomicity gaps in the credits and payments pipelines are the most consequential bugs. `applyCreditToInvoice` in `credits/service.js` calls `repo.decrementCreditGrant` and `invoicesRepo.addCreditLine` sequentially outside any transaction. A process crash or network interruption between those two calls leaves the credit balance decremented with no matching line on the invoice — the customer loses money silently. `updatePayment` reads the invoice balance and writes the updated `amountPaidMinor` without wrapping those two operations in a Prisma transaction; if two payments for the same invoice are confirmed concurrently, both will read the same stale balance and overwrite each other, resulting in an under-counted `amountPaidMinor`.

The webhook signature bypass is an operational risk rather than a structural bug: `verifyStripeSignature` returns `true` when `STRIPE_WEBHOOK_SECRET` is not set, and the same pattern appears for PayPal's `PAYPAL_WEBHOOK_ID`. The env schema marks both as `.optional()`, so a deployment that omits these secrets silently accepts any inbound webhook as authentic. There is no production guard (e.g., `if (env.NODE_ENV === 'production') throw`). A separate crash path exists in `app.js`: the raw-body middleware calls `JSON.parse(req.rawBody || '{}')` without a try/catch, so a Stripe test-mode event with a non-JSON body (rare but possible) will throw an unhandled error before the router's own error boundary.

The billing-period close pipeline computes `subtotalMinor` from line items using pure BigInt arithmetic, posts a `CHARGE` ledger entry, and creates the invoice atomically. The credit apply path guards for `DRAFT` or `OPEN` state before applying, but the state check and the balance decrement are not atomic — see the credit atomicity gap below.

---

<details>
<summary>Issues (5)</summary>

1. **Credit apply non-atomicity** — `applyCreditToInvoice` decrements the grant balance and then adds the credit line in two separate calls with no enclosing transaction. A crash between them silently loses the credit. Wrap both operations (and the ledger entry creation) in a single `prisma.$transaction`.

2. **Payment-invoice reconciliation race** — `updatePayment` reads `invoice.amountPaidMinor`, adds `payment.amountMinor`, and writes back the result, all outside a transaction. Concurrent SUCCEEDED transitions for payments on the same invoice will double-read the stale balance. Move the `invoice.findFirst` + `invoice.update` block inside a `prisma.$transaction` that also wraps `repo.updatePayment`.

3. **processRefund accepts FAILED refunds** — the guard `if (existing.status === 'SUCCEEDED') throw` does not cover FAILED state; calling `POST /refunds/:id/process` on a FAILED refund advances it to SUCCEEDED and updates the parent payment status. Add `if (existing.status !== 'PENDING') throw` to require the PENDING starting state.

4. **Webhook signature bypass in production** — `verifyStripeSignature` and `verifyPayPalSignature` return `true` when the respective secret env var is absent, and the env schema allows those vars to be omitted in any environment including production. Either make both secrets required in production (`z.string().min(1)` when `NODE_ENV === 'production'`) or add a `NODE_ENV === 'production'` throw inside the bypass branch.

5. **Raw-body middleware throws on non-JSON webhook payloads** — `app.js` line 23 calls `JSON.parse(req.rawBody || '{}')` without try/catch. A malformed or binary webhook body will throw before reaching the router. Wrap the parse in try/catch and fall through to letting the router handle an empty body, or propagate a 400 response there.

</details>

<details>
<summary>Details</summary>

### Credit apply atomicity gap

`applyCreditToInvoice` in `credits/service.js` (lines 112–119) executes three sequential side effects outside any transaction: `repo.decrementCreditGrant`, `invoicesRepo.addCreditLine`, and `ledgerRepo.createLedgerEntry`. If the process crashes or the database connection drops after the `decrementCreditGrant` call but before `addCreditLine`, the credit balance is permanently reduced with no corresponding invoice line — money disappears from the customer's credit pool without being applied anywhere. The fix is a single `prisma.$transaction` wrapping all three operations, analogous to how `refunds/service.js` handles its own multi-table write.

### Payment-invoice reconciliation race

`updatePayment` in `payments/service.js` (lines 68–87) first calls `repo.updatePayment` to commit the status change, then reads `invoice.amountPaidMinor` in a separate query, computes the new balance, and writes it back. These two database round-trips are not atomic. If two payments linked to the same invoice both transition to SUCCEEDED concurrently, both will read the same pre-update `amountPaidMinor` value, compute the same sum, and overwrite each other — the invoice ends up reflecting only one payment's contribution. The reconciliation block should run inside a `prisma.$transaction` that also wraps the payment update, or use Prisma's `increment` operator to avoid the read-modify-write pattern.

### processRefund state guard gap

`processRefund` in `refunds/service.js` (line 159) checks `if (existing.status === 'SUCCEEDED')` and throws. It does not check for `FAILED`. A refund record that has been marked FAILED (e.g., via a direct DB write or future FAILED transition) can be re-processed to SUCCEEDED through this endpoint, which will also set the parent payment to REFUNDED or PARTIALLY_REFUNDED even though the refund never actually succeeded. The guard should be `if (existing.status !== 'PENDING')`.

### Webhook signature bypass has no production gate

`verifyStripeSignature` (line 22–24) and `verifyPayPalSignature` (line 126–128) both unconditionally return `true` when the respective environment variable is not set. The env schema in `config/env.js` marks both as `z.string().optional()`, so a production deployment that forgets to set `STRIPE_WEBHOOK_SECRET` will silently accept unsigned webhooks from any source. The comment says "dev/test only" but there is nothing in the code that enforces that constraint. Either make the vars required in production via `z.string().min(1)` with an env-conditional refinement, or add a `if (env.NODE_ENV === 'production') { throw new Error(...) }` guard inside the bypass branch.

### Raw-body middleware JSON.parse without try/catch

`app.js` line 23: `req.body = JSON.parse(req.rawBody || '{}')`. This runs in the middleware pipeline before any Express error handler. A webhook delivery with a non-JSON content type (PayPal occasionally sends form-encoded test pings, and Stripe sends binary payloads for some event types) will throw a `SyntaxError` that propagates up uncaught outside the router's try/catch, resulting in a 500 rather than a clean 400. Wrapping the parse in try/catch and defaulting `req.body` to `{}` on failure is sufficient.

### Mixed Prisma import style

A subset of repositories — `meters/repository.js`, `customers/repository.js`, `organizations/repository.js`, `usage-events/repository.js`, `organizations/membership-repository.js`, `usage-aggregation/repository.js`, `products/repository.js`, `auth/service.js`, and `pricing/repository.js` — import the named `{ prisma }` export. The remainder use the default import. Both resolve to the same singleton. Worth standardizing to default import for consistency.



</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `src/app.js` | Raw-body capture middleware for webhook HMAC; BigInt JSON serialization patch |
| `src/config/env.js` | Stripe/PayPal webhook secrets added as optional env vars |
| `src/lib/api-response.js` | `ok`/`created` helpers return `{ data }` envelope |
| `src/middleware/rbac.js` | RBAC middleware with `requireOrgAccess`, `requireRole`, `requireMinRole` |
| `src/middleware/require-org.js` | Org-scoping header extraction |
| `src/middleware/auth.js` | JWT verification via `jose` |
| `src/routes.js` | All 35+ module routers mounted |
| `src/modules/payments/service.js` | Payment state machine + invoice reconciliation |
| `src/modules/refunds/service.js` | Refund creation (transaction) + processRefund |
| `src/modules/invoices/service.js` | Invoice CRUD + immutability guard + finalize/void |
| `src/modules/invoices/repository.js` | `createInvoice`, `addCreditLine` (transaction), `findLastInvoiceNumber` |
| `src/modules/credits/service.js` | `applyCreditToInvoice` (non-atomic) |
| `src/modules/credits/repository.js` | `decrementCreditGrant` using Prisma `decrement` |
| `src/modules/billing-periods/service.js` | `closeBillingPeriod` — usage aggregation, invoice generation, ledger entry |
| `src/modules/webhooks-inbound/service.js` | Stripe/PayPal HMAC verification + idempotency |
| `src/modules/webhooks-inbound/router.js` | Raw-body forwarding; fail-closed on missing rawBody |
| `src/modules/coupons/service.js` | Coupon validation + apply (transaction) |
| `src/modules/adjustments/service.js` | Adjustment creation (transaction) with invoice line |
| `src/modules/subscriptions/service.js` | Cancel, renew, process-expired subscription logic |
| `src/modules/usage-aggregation/service.js` | SUM/COUNT/MAX/LATEST aggregation; quantity returned as `Number` |
| All other module service/repo/router files | CRUD scaffolding scoped to `organizationId` via `requireOrg` |

Full diff: `git diff main -- apps/api/src/`

</details>
