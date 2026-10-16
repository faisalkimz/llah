import prisma from '../../lib/prisma.js';

export async function logEvent(orgId, actorUserId, data) {
  return prisma.auditEvent.create({
    data: {
      organizationId: orgId,
      actorUserId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      metadata: data.metadata,
    },
  });
}

export async function listEvents(orgId, filters) {
  const { action, resourceType, resourceId, actorId, from, to, limit, offset } = filters;

  const where = {
    organizationId: orgId,
    ...(action && { action }),
    ...(resourceType && { targetType: resourceType }),
    ...(resourceId && { targetId: resourceId }),
    ...(actorId && { actorUserId: actorId }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      },
    }),
  };

  return prisma.auditEvent.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEvent(id, orgId) {
  const event = await prisma.auditEvent.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }
  return event;
}

export async function getEventStats(orgId, { from, to }) {
  return prisma.auditEvent.groupBy({
    by: ['action'],
    where: {
      organizationId: orgId,
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    _count: { id: true },
  });
}
