# Phase 1 — Completion Report

All Phase 1 gaps for modules 01–12 have been closed.

---

## Files Changed

### New File
| File | What |
|------|------|
| `apps/api/src/middleware/require-org.js` | New `requireOrg` middleware — reads `x-organization-id` header, sets `req.organizationId`, returns 400 `MISSING_ORG` if absent |

---

### Task 1 — rbac.js
`apps/api/src/middleware/rbac.js` — No change needed. `requireOrgAccess` was already a direct async middleware function, not double-wrapped.

---

### Task 2 — requireOrg applied to routers (per-handler manual check removed)

| Router | Change |
|--------|--------|
| `apps/api/src/modules/adjustments/router.js` | Added `requireOrg` at router level; removed per-handler header checks |
| `apps/api/src/modules/api-keys/router.js` | Same |
| `apps/api/src/modules/billing-periods/router.js` | Same |
| `apps/api/src/modules/credits/router.js` | Same |
| `apps/api/src/modules/customers/router.js` | Same |
| `apps/api/src/modules/invoices/router.js` | Same |
| `apps/api/src/modules/ledger/router.js` | Same |
| `apps/api/src/modules/meters/router.js` | Same |
| `apps/api/src/modules/payments/router.js` | Same |
| `apps/api/src/modules/plans/router.js` | Same |
| `apps/api/src/modules/products/router.js` | Same |
| `apps/api/src/modules/refunds/router.js` | Same |
| `apps/api/src/modules/subscriptions/router.js` | Same |
| `apps/api/src/modules/usage-aggregation/router.js` | Same |
| `apps/api/src/modules/usage-events/router.js` | Same |
| `apps/api/src/modules/webhooks-inbound/router.js` | Removed `success()` import; no org header needed for webhook endpoints |

---

### Task 3 — Joi → Zod migration (validators)

All validators rewritten with `zod` — removed `joi` import, replaced `Joi.object(...)` with `z.object(...)`, kept same exported names.

| File | Schemas converted |
|------|-------------------|
| `apps/api/src/modules/adjustments/validators.js` | `createAdjustmentSchema`, `listAdjustmentsSchema` |
| `apps/api/src/modules/api-keys/validators.js` | `createApiKeySchema`, `listApiKeysSchema` |
| `apps/api/src/modules/billing-periods/validators.js` | `listBillingPeriodsSchema` |
| `apps/api/src/modules/credits/validators.js` | `createCreditGrantSchema`, `listCreditGrantsSchema` |
| `apps/api/src/modules/invoices/validators.js` | `createInvoiceSchema`, `updateInvoiceSchema`, `listInvoicesSchema` |
| `apps/api/src/modules/ledger/validators.js` | `createLedgerEntrySchema`, `listLedgerEntriesSchema` |
| `apps/api/src/modules/payments/validators.js` | `createPaymentSchema`, `updatePaymentSchema`, `listPaymentsSchema` |
| `apps/api/src/modules/plans/validators.js` | `createPlanSchema`, `updatePlanSchema`, `addPlanItemSchema`, `listPlansSchema` |
| `apps/api/src/modules/refunds/validators.js` | `createRefundSchema`, `listRefundsSchema` |
| `apps/api/src/modules/subscriptions/validators.js` | `createSubscriptionSchema`, `updateSubscriptionSchema`, `listSubscriptionsSchema` |
| `apps/api/src/modules/webhooks-inbound/validators.js` | `handleWebhookSchema` |

All routers updated to use `schema.safeParse()` instead of `schema.validate()`.

---

### Task 4 — API response envelope fixed

All routers in 01–12 that used `success()` / `errorResponse()` helpers now use `res.json({ data: ... })` and `res.json({ error: { code, message } })` directly.

---

### Task 5 — usage-aggregation COUNT / MAX / LATEST

`apps/api/src/modules/usage-aggregation/service.js`
- Fetches the `Meter` record to read its `aggregation` field
- **SUM**: `prisma.usageEvent.aggregate({ _sum: { quantity } })`
- **COUNT**: `prisma.usageEvent.count()`
- **MAX**: `prisma.usageEvent.aggregate({ _max: { quantity } })`
- **LATEST**: `prisma.usageEvent.findFirst({ orderBy: { eventAt: 'desc' } })`
- Fixed import from `{ prisma }` to default import

`apps/api/src/modules/usage-aggregation/router.js`
- Applied `requireOrg` middleware; removed per-handler org checks

---

### Task 6 — Subscription cancel-at-period-end + renewal

`apps/api/src/modules/subscriptions/service.js`
- Added `processExpiredSubscriptions()`: queries subscriptions where `cancelAtPeriodEnd=true AND currentPeriodEnd < now AND status != CANCELED`, sets status to `CANCELED`
- Added `renewSubscription(subscriptionId)`: advances `currentPeriodStart`/`currentPeriodEnd` by one billing interval using `plan.interval` + `plan.intervalCount`; supports DAY / WEEK / MONTH / YEAR via UTC date methods
- Fixed prisma import to use default import

---

## Verification
- `node --check src/app.js` — passed
- `node --check` on all 30 modified/created files — all passed
- `npm test` — pre-existing failure: Prisma client binary not generated (`prisma generate` required, no DATABASE_URL available in this environment). This failure is unrelated to Phase 1 changes.
