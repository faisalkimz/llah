import prisma from '../../lib/prisma.js';

export async function getSetting(orgId, key) {
  const record = await prisma.orgSetting.findUnique({
    where: { organizationId_key: { organizationId: orgId, key } },
  });
  return record ? record.value : null;
}

export async function setSetting(orgId, key, value) {
  return prisma.orgSetting.upsert({
    where: { organizationId_key: { organizationId: orgId, key } },
    create: { organizationId: orgId, key, value },
    update: { value },
  });
}

export async function listSettings(orgId) {
  return prisma.orgSetting.findMany({
    where: { organizationId: orgId },
    orderBy: { key: 'asc' },
  });
}

export async function deleteSetting(orgId, key) {
  await prisma.orgSetting.deleteMany({
    where: { organizationId: orgId, key },
  });
}

export async function getSettingsMap(orgId) {
  const settings = await listSettings(orgId);
  return settings.reduce((map, r) => {
    map[r.key] = r.value;
    return map;
  }, {});
}
