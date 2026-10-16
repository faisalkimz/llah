import prisma from '../../lib/prisma.js';

export async function setFlag(key, data) {
  return prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled: data.enabled, description: data.description },
    update: {
      enabled: data.enabled,
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

export async function getFlag(key) {
  return prisma.featureFlag.findUnique({ where: { key } });
}

export async function listFlags() {
  return prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
}

export async function deleteFlag(key) {
  return prisma.featureFlag.delete({ where: { key } });
}

export async function isEnabled(key) {
  const flag = await getFlag(key);
  return flag?.enabled ?? false;
}
