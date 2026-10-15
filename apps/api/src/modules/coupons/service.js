// coupons business rules. Keep Express request/response objects out of this layer.
import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';
import * as invoicesRepo from '../invoices/repository.js';

/**
 * createCoupon
 *
 * @param {string} orgId
 * @param {{ code, discountType, discountValue, maxRedemptions?, expiresAt? }} params
 */
export async function createCoupon(orgId, { code, discountType, discountValue, maxRedemptions, expiresAt }) {
  // Validate discountValue based on type
  if (discountType === 'PERCENTAGE') {
    if (discountValue < 0 || discountValue > 100) {
      const err = new Error('discountValue for PERCENTAGE must be between 0 and 100');
      err.status = 422;
      throw err;
    }
  } else {
    // FIXED_AMOUNT
    if (discountValue <= 0) {
      const err = new Error('discountValue for FIXED_AMOUNT must be a positive integer (minor units)');
      err.status = 422;
      throw err;
    }
  }

  // expiresAt must be in the future if provided
  if (expiresAt) {
    const expiry = new Date(expiresAt);
    if (expiry <= new Date()) {
      const err = new Error('expiresAt must be a future date');
      err.status = 422;
      throw err;
    }
  }

  // Store code as uppercase for case-insensitive uniqueness
  const uppercaseCode = code.toUpperCase();

  // Check uniqueness (Prisma unique constraint will also catch this, but give a friendlier error)
  const existing = await repo.findCouponByCode(orgId, uppercaseCode);
  if (existing) {
    const err = new Error(`Coupon code '${uppercaseCode}' already exists for this organization`);
    err.status = 409;
    throw err;
  }

  return await repo.createCoupon({
    orgId,
    code: uppercaseCode,
    discountType,
    discountValue,
    maxRedemptions: maxRedemptions ?? null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });
}

/**
 * applyCouponToInvoice
 *
 * Looks up the coupon by code + orgId, validates it, calculates the discount,
 * adds an InvoiceLine of type DISCOUNT, increments redemptionCount, and returns
 * the updated invoice.
 *
 * @param {string} code
 * @param {string} invoiceId
 * @param {string} orgId
 */
export async function applyCouponToInvoice(code, invoiceId, orgId) {
  // 1. Find coupon (case-insensitive)
  const coupon = await repo.findCouponByCode(orgId, code.toUpperCase());
  if (!coupon) {
    const err = new Error('Coupon not found');
    err.status = 404;
    throw err;
  }

  // 2. Validate active
  if (!coupon.active) {
    const err = new Error('Coupon is no longer active');
    err.status = 422;
    throw err;
  }

  // 3. Validate not expired
  if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
    const err = new Error('Coupon has expired');
    err.status = 422;
    throw err;
  }

  // 4. Validate redemption limit
  if (coupon.maxRedemptions !== null && coupon.redemptionCount >= coupon.maxRedemptions) {
    const err = new Error('Coupon has reached its maximum number of redemptions');
    err.status = 422;
    throw err;
  }

  // 5. Fetch invoice
  const invoice = await invoicesRepo.findInvoiceById(invoiceId, orgId);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  // 6. Calculate discount amount (integer arithmetic only)
  const subtotal = BigInt(invoice.subtotalMinor);
  let discountAmount;

  if (coupon.discountType === 'PERCENTAGE') {
    // floor(subtotal * discountValue / 100) — integer only
    discountAmount = (subtotal * BigInt(coupon.discountValue)) / BigInt(100);
  } else {
    // FIXED_AMOUNT — cap at subtotal
    const fixedAmount = BigInt(coupon.discountValue);
    discountAmount = fixedAmount > subtotal ? subtotal : fixedAmount;
  }

  // 7. Run update in a transaction: add InvoiceLine + update totals + increment redemptionCount
  const updatedInvoice = await prisma.$transaction(async (tx) => {
    // Add DISCOUNT InvoiceLine (negative amount reduces total)
    await tx.invoiceLine.create({
      data: {
        invoiceId,
        description: `Coupon discount: ${coupon.code}`,
        quantity: 1,
        unitAmountMinor: -discountAmount,
        amountMinor: -discountAmount,
      },
    });

    // Update invoice: discountMinor and totalMinor
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        discountMinor: BigInt(invoice.discountMinor) + discountAmount,
        totalMinor: BigInt(invoice.totalMinor) - discountAmount,
      },
      include: { customer: true, lines: true },
    });

    // Increment coupon redemption count
    await tx.coupon.update({
      where: { id: coupon.id },
      data: { redemptionCount: { increment: 1 } },
    });

    return updated;
  });

  return updatedInvoice;
}

/**
 * listCoupons — return all coupons for an org.
 * @param {string} orgId
 */
export async function listCoupons(orgId) {
  return await repo.findCouponsByOrg(orgId);
}

/**
 * getCoupon — return a single coupon or throw 404.
 * @param {string} orgId
 * @param {string} id
 */
export async function getCoupon(orgId, id) {
  const coupon = await repo.findCouponById(orgId, id);
  if (!coupon) {
    const err = new Error('Coupon not found');
    err.status = 404;
    throw err;
  }
  return coupon;
}

/**
 * deactivateCoupon — set active=false.
 * @param {string} orgId
 * @param {string} id
 */
export async function deactivateCoupon(orgId, id) {
  // Verify it exists first
  await getCoupon(orgId, id);
  await repo.deactivateCoupon(orgId, id);
  return repo.findCouponById(orgId, id);
}
