import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';
import * as invoicesRepo from '../invoices/repository.js';
import { buildInvoiceNumber } from '../invoices/service.js';
import { aggregateUsage } from '../usage-aggregation/service.js';
import { randomUUID } from 'node:crypto';
import { dispatchEvent } from '../webhooks-outbound/service.js';
import { createNotification } from '../notifications/service.js';

export async function listBillingPeriods(organizationId, filters) {
  return await repo.findBillingPeriodsByOrganization(organizationId, filters);
}

/**
 * Close a billing period (represented by a subscription) for the given org.
 * The entire pipeline runs inside a single Prisma transaction so that the
 * invoice, its lines, the ledger entry, and the subscription state update
 * either all succeed or all roll back.
 *
 * Steps:
 *  1. Fetch the subscription — validate it belongs to the org and is ACTIVE
 *  2. Aggregate usage for all meters linked to the plan's prices
 *  3. Create an Invoice with line items derived from plan prices + usage
 *  4. Compute subtotalMinor as sum of line item amounts (integer arithmetic)
 *  5. Post a LedgerEntry of type CHARGE (INVOICE_CREATED doesn't exist in schema enum; use CHARGE)
 *  6. Close the period: cancel if `cancelAtPeriodEnd`, otherwise advance (renew) the period
 *  7. Return the created invoice
 */
export async function closeBillingPeriod(orgId, subscriptionId) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch subscription with plan items and prices
    const subscription = await tx.subscription.findFirst({
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

    // Generate the invoice number using the shared helper (no inline duplication)
    const lastNumber = await invoicesRepo.findLastInvoiceNumber(orgId);
    const invoiceNumber = buildInvoiceNumber(orgId, lastNumber);

    // Create the invoice with line items on the transaction
    const invoice = await tx.invoice.create({
      data: {
        organizationId: orgId,
        customerId: subscription.customerId,
        number: invoiceNumber,
        status: 'DRAFT',
        currency: 'USD',
        subtotalMinor,
        totalMinor: subtotalMinor,
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
        lines: {
          create: lines.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitAmountMinor: l.unitAmountMinor,
            amountMinor: l.amountMinor
          }))
        }
      },
      include: {
        customer: true,
        lines: true
      }
    });

    // 5. Post ledger entry — use CHARGE type (closest to INVOICE_CREATED in schema)
    await tx.ledgerEntry.create({
      data: {
        organizationId: orgId,
        customerId: subscription.customerId,
        type: 'CHARGE',
        currency: 'USD',
        amountMinor: subtotalMinor,
        referenceType: 'Invoice',
        referenceId: invoice.id,
        description: `Invoice ${invoiceNumber} created for billing period close`
      },
      include: {
        customer: true
      }
    });

    // 6. Close the period: cancel if flagged, otherwise advance (renew) the period
    if (subscription.cancelAtPeriodEnd) {
      // Cancel: set status CANCELED inside the transaction
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELED' }
      });
    } else {
      // Renew: advance the period by one interval
      const interval = subscription.plan?.interval || 'month';
      const nextStart = new Date(subscription.currentPeriodEnd);
      const nextEnd = new Date(nextStart);
      if (interval === 'month') nextEnd.setMonth(nextEnd.getMonth() + 1);
      else if (interval === 'year') nextEnd.setFullYear(nextEnd.getFullYear() + 1);
      else if (interval === 'week') nextEnd.setDate(nextEnd.getDate() + 7);
      else if (interval === 'day') nextEnd.setDate(nextEnd.getDate() + 1);
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { currentPeriodStart: nextStart, currentPeriodEnd: nextEnd }
      });
    }

    // 7. Return the invoice
    Promise.allSettled([
      dispatchEvent(orgId, 'invoice.created', randomUUID(), { id: invoice.id, organizationId: orgId, customerId: invoice.customerId, number: invoice.number, status: invoice.status, totalMinor: String(invoice.totalMinor) }),
      createNotification(orgId, { type: 'INVOICE_CREATED', title: `Invoice ${invoice.number} created`, message: `Invoice ${invoice.number} has been created for billing period close.`, metadata: { invoiceId: invoice.id, subscriptionId } })
    ]).catch(() => {});
    return invoice;
  });
}
