import * as repo from './repository.js';

export async function createPayment(organizationId, paymentData) {
  return await repo.createPayment({
    ...paymentData,
    organizationId,
    status: 'PENDING'
  });
}

export async function listPayments(organizationId, filters) {
  return await repo.findPaymentsByOrganization(organizationId, filters);
}

export async function getPayment(paymentId, organizationId) {
  const payment = await repo.findPaymentById(paymentId, organizationId);
  if (!payment) {
    const error = new Error('Payment not found');
    error.status = 404;
    throw error;
  }
  return payment;
}

export async function updatePayment(paymentId, organizationId, updates) {
  const payment = await repo.findPaymentById(paymentId, organizationId);
  if (!payment) {
    const error = new Error('Payment not found');
    error.status = 404;
    throw error;
  }
  return await repo.updatePayment(paymentId, organizationId, updates);
}
