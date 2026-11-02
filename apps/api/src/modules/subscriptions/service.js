import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';
import { randomUUID } from 'node:crypto';
import { dispatchEvent } from '../webhooks-outbound/service.js';
import { createNotification } from '../notifications/service.js';

export async function createSubscription(organizationId, subscriptionData) {
  const { planId, currentPeriodStart: _cps, currentPeriodEnd: _cpe, ...rest } = subscriptionData;
  const plan = planId ? await prisma.plan.findUnique({ where: { id: planId } }) : null;
  const now = new Date();
  const interval = plan?.interval || 'MONTH';
  const intervalCount = plan?.intervalCount || 1;
  const periodStart = now;
  const periodEnd = advanceDate(now, interval, intervalCount);
  return await repo.createSubscription({
    ...rest,
    organizationId,
    planId,
    status: 'ACTIVE',
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
  });
}

export async function listSubscriptions(organizationId, filters) {
  return await repo.findSubscriptionsByOrganization(organizationId, filters);
}

export async function getSubscription(subscriptionId, organizationId) {
  const subscription = await repo.findSubscriptionById(subscriptionId, organizationId);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }
  return subscription;
}

export async function updateSubscription(subscriptionId, organizationId, updates) {
  const subscription = await repo.findSubscriptionById(subscriptionId, organizationId);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }
  return await repo.updateSubscription(subscriptionId, organizationId, updates);
}

export async function cancelSubscription(subscriptionId, organizationId, immediate = false) {
  const subscription = await repo.findSubscriptionById(subscriptionId, organizationId);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  let updated;
  if (immediate) {
    updated = await repo.updateSubscription(subscriptionId, organizationId, {
      status: 'CANCELED',
    });
  } else {
    updated = await repo.updateSubscription(subscriptionId, organizationId, {
      cancelAtPeriodEnd: true,
    });
  }
  Promise.allSettled([
    dispatchEvent(organizationId, 'subscription.canceled', randomUUID(), { subscriptionId, organizationId, customerId: subscription.customerId, immediate }),
    createNotification(organizationId, { type: 'SUBSCRIPTION_CANCELED', title: immediate ? 'Subscription canceled' : 'Subscription scheduled for cancellation', message: immediate ? 'Your subscription has been canceled.' : 'Your subscription will be canceled at the end of the current period.', metadata: { subscriptionId } })
  ]).catch(() => {});
  return updated;
}

/**
 * Find all ACTIVE subscriptions past their period end (not flagged for
 * cancellation) and renew them by advancing the billing period.
 */
export async function processActiveSubscriptionRenewals() {
  const now = new Date();
  const due = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: { lt: now },
    },
    select: { id: true, organizationId: true },
  });
  return await Promise.all(due.map(({ id }) => renewSubscription(id)));
}

/**
 * Find all subscriptions flagged for cancellation at period end where the
 * period has already passed, and mark them as CANCELED.
 */
export async function processExpiredSubscriptions() {
  const now = new Date();
  const expired = await prisma.subscription.findMany({
    where: {
      cancelAtPeriodEnd: true,
      currentPeriodEnd: { lt: now },
      status: { not: 'CANCELED' },
    },
    select: { id: true, organizationId: true },
  });

  const updates = await Promise.all(
    expired.map(({ id, organizationId }) =>
      repo.updateSubscription(id, organizationId, { status: 'CANCELED' })
    )
  );

  return updates;
}

/** Map plan interval strings to milliseconds for date arithmetic. */
const INTERVAL_MS = {
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: null, // handled with Date methods
  YEAR: null,  // handled with Date methods
};

function advanceDate(date, interval, intervalCount) {
  const d = new Date(date);
  const count = intervalCount || 1;
  switch (interval.toUpperCase()) {
    case 'DAY':
      d.setUTCDate(d.getUTCDate() + count);
      break;
    case 'WEEK':
      d.setUTCDate(d.getUTCDate() + count * 7);
      break;
    case 'MONTH':
      d.setUTCMonth(d.getUTCMonth() + count);
      break;
    case 'YEAR':
      d.setUTCFullYear(d.getUTCFullYear() + count);
      break;
    default:
      d.setUTCMonth(d.getUTCMonth() + count);
  }
  return d;
}

/**
 * Advance a subscription's billing period by one interval.
 * Reads interval and intervalCount from the plan attached to the subscription.
 */
export async function renewSubscription(subscriptionId) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  // Plans may store billing interval directly or via items/prices.
  // We look for interval/intervalCount on the plan model first;
  // fall back to MONTH / 1 if not present.
  const interval = subscription.plan.interval || 'MONTH';
  const intervalCount = subscription.plan.intervalCount || 1;

  const newPeriodStart = new Date(subscription.currentPeriodEnd);
  const newPeriodEnd = advanceDate(newPeriodStart, interval, intervalCount);

  const renewed = await repo.updateSubscription(subscriptionId, subscription.organizationId, {
    currentPeriodStart: newPeriodStart,
    currentPeriodEnd: newPeriodEnd,
    status: 'ACTIVE',
  });
  Promise.allSettled([
    dispatchEvent(subscription.organizationId, 'subscription.renewed', randomUUID(), { subscriptionId, organizationId: subscription.organizationId, customerId: subscription.customerId }),
    createNotification(subscription.organizationId, { type: 'SUBSCRIPTION_RENEWED', title: 'Subscription renewed', message: 'Your subscription has been renewed for the next billing period.', metadata: { subscriptionId } })
  ]).catch(() => {});
  return renewed;
}
