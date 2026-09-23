import * as repo from './repository.js';

export async function createAdjustment(organizationId, adjustmentData) {
  return await repo.createAdjustment({
    ...adjustmentData,
    organizationId
  });
}

export async function listAdjustments(organizationId, filters) {
  return await repo.findAdjustmentsByOrganization(organizationId, filters);
}

export async function getAdjustment(adjustmentId, organizationId) {
  const adjustment = await repo.findAdjustmentById(adjustmentId, organizationId);
  if (!adjustment) {
    const error = new Error('Adjustment not found');
    error.status = 404;
    throw error;
  }
  return adjustment;
}
