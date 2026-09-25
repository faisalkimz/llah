import prisma from '../../lib/prisma.js';
import { createHash, randomBytes } from 'node:crypto';

export async function createApiKey(data) {
  // Generate random API key: llah_<prefix>_<secret>
  const prefix = randomBytes(8).toString('hex'); // 16 chars
  const secret = randomBytes(24).toString('hex'); // 48 chars
  const key = `llah_${prefix}_${secret}`;
  const secretHash = createHash('sha256').update(secret).digest('hex');

  const apiKey = await prisma.apiKey.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      prefix,
      secretHash
    }
  });

  // Return the full key only once, on creation
  return { ...apiKey, key };
}

export async function findApiKeysByOrganization(organizationId, filters = {}) {
  const { limit = 20, offset = 0 } = filters;

  return await prisma.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

export async function findApiKeyById(keyId, organizationId) {
  return await prisma.apiKey.findFirst({
    where: { id: keyId, organizationId }
  });
}

export async function revokeApiKey(keyId, organizationId) {
  return await prisma.apiKey.update({
    where: { id: keyId, organizationId },
    data: { 
      revokedAt: new Date(),
      status: 'REVOKED'
    }
  });
}

export async function findApiKeyByKey(key) {
  // Parse key: llah_<prefix>_<secret>
  const parts = key.split('_');
  if (parts.length !== 3 || parts[0] !== 'llah') {
    return null;
  }

  const prefix = parts[1];
  const secret = parts[2];
  const secretHash = createHash('sha256').update(secret).digest('hex');
  
  return await prisma.apiKey.findFirst({
    where: { 
      prefix,
      secretHash,
      status: 'ACTIVE',
      revokedAt: null
    },
    include: {
      organization: true
    }
  });
}

export async function updateLastUsed(keyId) {
  return await prisma.apiKey.update({
    where: { id: keyId },
    data: { lastUsedAt: new Date() }
  });
}
