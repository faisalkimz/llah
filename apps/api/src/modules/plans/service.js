import * as repo from './repository.js';

export async function createPlan(organizationId, planData) {
  return await repo.createPlan({
    ...planData,
    organizationId
  });
}

export async function listPlans(organizationId, filters) {
  return await repo.findPlansByOrganization(organizationId, filters);
}

export async function getPlan(planId, organizationId) {
  const plan = await repo.findPlanById(planId, organizationId);
  if (!plan) {
    const error = new Error('Plan not found');
    error.status = 404;
    throw error;
  }
  return plan;
}

export async function updatePlan(planId, organizationId, updates) {
  const plan = await repo.findPlanById(planId, organizationId);
  if (!plan) {
    const error = new Error('Plan not found');
    error.status = 404;
    throw error;
  }
  return await repo.updatePlan(planId, organizationId, updates);
}

export async function deletePlan(planId, organizationId) {
  const plan = await repo.findPlanById(planId, organizationId);
  if (!plan) {
    const error = new Error('Plan not found');
    error.status = 404;
    throw error;
  }
  return await repo.deletePlan(planId, organizationId);
}

export async function addPlanItem(planId, organizationId, itemData) {
  const item = await repo.addPlanItem(planId, organizationId, itemData);
  if (!item) {
    const error = new Error('Plan not found');
    error.status = 404;
    throw error;
  }
  return item;
}

export async function removePlanItem(itemId, organizationId) {
  const item = await repo.removePlanItem(itemId, organizationId);
  if (!item) {
    const error = new Error('Plan item not found');
    error.status = 404;
    throw error;
  }
  return item;
}
