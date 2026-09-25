import * as repo from './repository.js';

export async function createApiKey(organizationId, keyData) {
  return await repo.createApiKey({
    ...keyData,
    organizationId
  });
}

export async function listApiKeys(organizationId, filters) {
  return await repo.findApiKeysByOrganization(organizationId, filters);
}

export async function getApiKey(keyId, organizationId) {
  const apiKey = await repo.findApiKeyById(keyId, organizationId);
  if (!apiKey) {
    const error = new Error('API key not found');
    error.status = 404;
    throw error;
  }
  return apiKey;
}

export async function revokeApiKey(keyId, organizationId) {
  const apiKey = await repo.findApiKeyById(keyId, organizationId);
  if (!apiKey) {
    const error = new Error('API key not found');
    error.status = 404;
    throw error;
  }

  if (apiKey.revokedAt) {
    const error = new Error('API key already revoked');
    error.status = 400;
    throw error;
  }

  return await repo.revokeApiKey(keyId, organizationId);
}
