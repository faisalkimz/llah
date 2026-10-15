import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';

export async function createSubscription(organizationId, subscriptionData) {
  return await repo.createSubscription({
    ...subscriptionData,
    organizationId,
    status: 'ACTIVE',
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

  if (immediate) {
    return await repo.updateSubscription(subscriptionId, organizationId, {
      status: 'CANCELED',
    });
  } else {
    return await repo.updateSubscription(subscriptionId, organizationId, {
      cancelAtPeriodEnd: true,
    });
  }
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

  return await repo.updateSubscription(subscriptionId, subscription.organizationId, {
    currentPeriodStart: newPeriodStart,
    currentPeriodEnd: newPeriodEnd,
    status: 'ACTIVE',
  });
}
