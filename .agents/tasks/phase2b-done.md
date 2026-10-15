# Phase 2b — Completion Report (Modules 18–20)

All modules 18–20 implemented and verified with `node --check`.
`npx prisma validate` passes. `npx prisma generate` completed (Prisma client updated to include the new `Coupon` model).

> **Migration note**: `prisma migrate dev --name add_coupon_model` was NOT run automatically because no live PostgreSQL connection was available during this step. Run it once `DATABASE_URL` points to a reachable database.

---

## Files Changed

### Module 18 — adjustments: Ledger Entry Creation

| File | What changed |
|------|--------------|
| `apps/api/src/modules/adjustments/validators.js` | Added optional `invoiceId` field; changed `amountMinor` to a non-zero integer (was `.positive()`); reordered enum to `CREDIT \| DEBIT` to match spec |
| `apps/api/src/modules/adjustments/service.js` | Full rewrite: validates `amountMinor != 0`; runs in a Prisma `$transaction`; creates LedgerEntry (CREDIT for CREDIT type, ADJUSTMENT for DEBIT); if `invoiceId` provided, creates InvoiceLine and updates `invoice.totalMinor`; returns `{ adjustment: ledgerEntry }` |

### Module 19 — refunds: Refund Amount Validation + Status Machine

| File | What changed |
|------|--------------|
| `apps/api/src/modules/refunds/service.js` | Full rewrite: `createRefund` — fetches payment (404 if missing), validates SUCCEEDED state (422), validates `amountMinor <= payment.amountMinor`, sums existing refunds and validates no over-refund; transaction creates Refund (PENDING), posts LedgerEntry (type: REFUND), reconciles invoice (`amountPaidMinor -= amountMinor`, reverts to OPEN if under-paid). `processRefund` — stub that calls `prisma.refund.update` with TODO comment for provider API call |
| `apps/api/src/modules/refunds/router.js` | Added `POST /:refundId/process` endpoint that calls `service.processRefund` |

### Module 20 — coupons: Full Implementation

| File | What changed |
|------|--------------|
| `prisma/schema.prisma` | Added `DiscountType` enum (`PERCENTAGE \| FIXED_AMOUNT`) and `Coupon` model with `@@unique([orgId, code])` and `@@map("coupons")` |
| `apps/api/src/modules/coupons/repository.js` | New file — full Prisma CRUD: `createCoupon`, `findCouponByCode` (uppercase normalised), `findCouponById`, `findCouponsByOrg`, `incrementRedemptionCount`, `deactivateCoupon` |
| `apps/api/src/modules/coupons/service.js` | Full rewrite from 2-line stub: `createCoupon` (validates PERCENTAGE 0–100, FIXED_AMOUNT > 0, future `expiresAt`, unique code per org), `applyCouponToInvoice` (validates active/expiry/redemption limit, integer arithmetic for discount, transactionally adds InvoiceLine + updates `discountMinor`/`totalMinor` + increments `redemptionCount`), `listCoupons`, `getCoupon`, `deactivateCoupon` |
| `apps/api/src/modules/coupons/validators.js` | New file — Zod schemas: `createCouponSchema`, `applyCouponSchema` |
| `apps/api/src/modules/coupons/router.js` | Full Express router replacing 1-line 501 stub: `POST /`, `GET /`, `POST /apply` (before `/:id` to avoid route shadowing), `GET /:id`, `DELETE /:id` |

---

## Verification

- `node --check src/app.js` — exit 0
- `node --check` on all 8 changed source files — exit 0
- `npx prisma validate` — "The schema at ...schema.prisma is valid 🚀"
- `npx prisma generate` — Prisma client regenerated (exit 0), includes `coupon` model

---

## Key Design Decisions

- **Adjustment type mapping**: `CREDIT → LedgerEntryType.CREDIT`, `DEBIT → LedgerEntryType.ADJUSTMENT`. The schema's `LedgerEntryType` enum has no DEBIT value; ADJUSTMENT is the semantic equivalent.
- **Refund LedgerEntry type**: Used `REFUND` (schema has this variant) with positive `amountMinor`. The ledger is append-only; callers can infer direction from `type`.
- **processRefund stub**: Updates the Refund record in place. The TODO comment marks where a provider API call should be injected. The Refund schema has no `status` field, so the stub records the provider refund ID when available.
- **Coupon integer arithmetic**: PERCENTAGE discount uses BigInt division (integer floor, no floats). FIXED_AMOUNT is capped at `invoice.subtotalMinor` so the discount never exceeds the invoice.
- **`/apply` route ordering**: Declared before `/:id` in the router to prevent Express from interpreting `apply` as a coupon ID.
- **All 20 module routers**: Already registered in `apps/api/src/routes.js` — no changes needed.
