import * as repo from './repository.js';
import { logEvent } from '../event-log/service.js';

export async function createApiKey(organizationId, keyData) {
  const created = await repo.createApiKey({
    ...keyData,
    organizationId
  });
  logEvent(organizationId, null, { action: 'api_key.create', targetType: 'ApiKey', targetId: created.id, metadata: { name: created.name } }).catch(() => {});
  return created;
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

  const revoked = await repo.revokeApiKey(keyId, organizationId);
  logEvent(organizationId, null, { action: 'api_key.revoke', targetType: 'ApiKey', targetId: keyId, metadata: {} }).catch(() => {});
  return revoked;
}
