import * as repo from './repository.js';

export async function createRefund(organizationId, refundData) {
  // Verify payment belongs to organization
  const payment = await repo.findRefundById(refundData.paymentId, organizationId);
  
  return await repo.createRefund(refundData);
}

export async function listRefunds(organizationId, filters) {
  return await repo.findRefundsByOrganization(organizationId, filters);
}

export async function getRefund(refundId, organizationId) {
  const refund = await repo.findRefundById(refundId, organizationId);
  if (!refund) {
    const error = new Error('Refund not found');
    error.status = 404;
    throw error;
  }
  return refund;
}
