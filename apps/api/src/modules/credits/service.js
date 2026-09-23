import * as repo from './repository.js';

export async function createCreditGrant(organizationId, grantData) {
  return await repo.createCreditGrant({
    ...grantData,
    organizationId
  });
}

export async function listCreditGrants(organizationId, filters) {
  return await repo.findCreditGrantsByOrganization(organizationId, filters);
}

export async function getCreditGrant(grantId, organizationId) {
  const grant = await repo.findCreditGrantById(grantId, organizationId);
  if (!grant) {
    const error = new Error('Credit grant not found');
    error.status = 404;
    throw error;
  }
  return grant;
}
