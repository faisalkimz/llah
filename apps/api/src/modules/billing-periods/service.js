import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';
import * as invoicesRepo from '../invoices/repository.js';
import * as ledgerRepo from '../ledger/repository.js';
import { aggregateUsage } from '../usage-aggregation/service.js';

export async function listBillingPeriods(organizationId, filters) {
  return await repo.findBillingPeriodsByOrganization(organizationId, filters);
}

/**
 * Close a billing period (represented by a subscription) for the given org.
 * Steps:
 *  1. Fetch the subscription — validate it belongs to the org and is ACTIVE
 *  2. Aggregate usage for all meters linked to the plan's prices
 *  3. Create an Invoice with line items derived from plan prices + usage
 *  4. Compute subtotalMinor as sum of line item amounts (integer arithmetic)
 *  5. Post a LedgerEntry of type CHARGE (INVOICE_CREATED doesn't exist in schema enum; use CHARGE)
 *  6. Mark subscription status as CANCELED (period closed)
 *  7. Return the created invoice
 */
export async function closeBillingPeriod(orgId, subscriptionId) {
  // 1. Fetch subscription with plan items and prices
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, organizationId: orgId },
    include: {
      plan: {
        include: {
          items: {
            include: {
              price: {
                include: {
                  meter: true,
                  product: true
                }
              }
            }
          }
        }
      },
      customer: true
    }
  });

  if (!subscription) {
    const err = new Error('Billing period not found');
    err.status = 404;
    throw err;
  }

  // Only ACTIVE subscriptions can be closed
  if (subscription.status !== 'ACTIVE') {
    const err = new Error(`Cannot close billing period: subscription is ${subscription.status}`);
    err.status = 422;
    throw err;
  }

  // 2. Aggregate usage for each metered price in the plan
  const usageByMeterId = {};
  for (const item of subscription.plan.items) {
    const price = item.price;
    if (price.meter) {
      try {
        const agg = await aggregateUsage(orgId, {
          customerId: subscription.customerId,
          meterId: price.meterId,
          periodStart: subscription.currentPeriodStart.toISOString(),
          periodEnd: subscription.currentPeriodEnd.toISOString()
        });
        // agg.quantity may be a Number (Float schema) or BigInt (BigInt schema).
        // Convert via String to avoid Number() precision loss above MAX_SAFE_INTEGER,
        // then floor-truncate by dropping any decimal portion before passing to BigInt.
        const rawQty = agg.quantity ?? 0;
        usageByMeterId[price.meterId] = BigInt(String(rawQty).split('.')[0] || '0');
      } catch {
        usageByMeterId[price.meterId] = BigInt(0);
      }
    }
  }

  // 3. Build line items from plan prices
  const lines = subscription.plan.items.map((item) => {
    const price = item.price;
    const isMetered = !!price.meter;
    // quantity is BigInt for metered prices, Number (1) for flat prices
    const quantity = isMetered ? (usageByMeterId[price.meterId] ?? BigInt(0)) : BigInt(1);
    const unitAmountMinor = price.unitAmountMinor != null ? BigInt(price.unitAmountMinor) : BigInt(0);
    return {
      description: price.product
        ? `${price.product.name} — ${price.name}`
        : price.name,
      quantity: Number(quantity),
      unitAmountMinor,
      // amountMinor = quantity * unitAmountMinor  (all BigInt arithmetic)
      amountMinor: quantity * unitAmountMinor
    };
  });

  // 4. Compute subtotalMinor (integer, no floats)
  const subtotalMinor = lines.reduce((sum, l) => sum + l.amountMinor, BigInt(0));

  // Generate invoice number: INV-{first6ofOrgId}-{zero-padded 4-digit}
  const existing = await prisma.invoice.findFirst({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    select: { number: true }
  });

  let nextSeq = 1;
  if (existing?.number) {
    const parts = existing.number.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }

  const prefix = orgId.slice(0, 6);
  const invoiceNumber = `INV-${prefix}-${String(nextSeq).padStart(4, '0')}`;

  // Create the invoice with line items
  const invoice = await invoicesRepo.createInvoice({
    organizationId: orgId,
    customerId: subscription.customerId,
    number: invoiceNumber,
    status: 'DRAFT',
    currency: 'USD',
    subtotalMinor,
    totalMinor: subtotalMinor,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    lines: lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitAmountMinor: l.unitAmountMinor,
      amountMinor: l.amountMinor
    }))
  });

  // 5. Post ledger entry — use CHARGE type (closest to INVOICE_CREATED in schema)
  await ledgerRepo.createLedgerEntry({
    organizationId: orgId,
    customerId: subscription.customerId,
    type: 'CHARGE',
    currency: 'USD',
    amountMinor: subtotalMinor,
    referenceType: 'Invoice',
    referenceId: invoice.id,
    description: `Invoice ${invoiceNumber} created for billing period close`
  });

  // 6. Close the subscription period by advancing it (mark as CANCELED)
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'CANCELED' }
  });

  // 7. Return the invoice
  return invoice;
}
