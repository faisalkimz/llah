import * as repo from './repository.js';

export async function createSubscription(organizationId, subscriptionData) {
  return await repo.createSubscription({
    ...subscriptionData,
    organizationId,
    status: 'ACTIVE'
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
      status: 'CANCELED'
    });
  } else {
    return await repo.updateSubscription(subscriptionId, organizationId, {
      cancelAtPeriodEnd: true
    });
  }
}
