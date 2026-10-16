import prisma from '../../lib/prisma.js';

export async function createNotification(orgId, data) {
  return prisma.notification.create({
    data: {
      organizationId: orgId,
      userId: data.userId ?? null,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata ?? null,
    },
  });
}

export async function listNotifications(orgId, filters = {}) {
  const where = { organizationId: orgId };

  if (filters.userId != null) {
    where.userId = filters.userId;
  }
  if (filters.read != null) {
    where.read = filters.read;
  }
  if (filters.type != null) {
    where.type = filters.type;
  }

  const take = filters.limit ?? 20;
  const skip = filters.offset ?? 0;

  return prisma.notification.findMany({
    where,
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getNotification(id, orgId) {
  const notif = await prisma.notification.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!notif) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }
  return notif;
}

export async function markAsRead(id, orgId) {
  await getNotification(id, orgId);
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead(orgId, userId) {
  const where = { organizationId: orgId, read: false };
  if (userId) {
    where.userId = userId;
  }
  return prisma.notification.updateMany({ where, data: { read: true } });
}

export async function deleteNotification(id, orgId) {
  await getNotification(id, orgId);
  await prisma.notification.delete({ where: { id } });
}

export async function getUnreadCount(orgId, userId) {
  const where = { organizationId: orgId, read: false };
  if (userId) {
    where.userId = userId;
  }
  return prisma.notification.count({ where });
}
