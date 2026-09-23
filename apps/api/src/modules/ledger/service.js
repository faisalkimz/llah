import * as repo from './repository.js';

export async function createLedgerEntry(organizationId, entryData) {
  return await repo.createLedgerEntry({
    ...entryData,
    organizationId
  });
}

export async function listLedgerEntries(organizationId, filters) {
  return await repo.findLedgerEntriesByOrganization(organizationId, filters);
}

export async function getLedgerEntry(entryId, organizationId) {
  const entry = await repo.findLedgerEntryById(entryId, organizationId);
  if (!entry) {
    const error = new Error('Ledger entry not found');
    error.status = 404;
    throw error;
  }
  return entry;
}
