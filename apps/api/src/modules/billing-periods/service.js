import * as repo from './repository.js';

export async function listBillingPeriods(organizationId, filters) {
  return await repo.findBillingPeriodsByOrganization(organizationId, filters);
}
