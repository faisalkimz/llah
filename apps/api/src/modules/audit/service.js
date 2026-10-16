import prisma from '../../lib/prisma.js';

export async function listAuditLog(orgId, { limit, offset }) {
  return prisma.auditEvent.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      actor: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

export async function getAuditEntry(id, orgId) {
  const entry = await prisma.auditEvent.findFirst({
    where: { id, organizationId: orgId },
    include: {
      actor: {
        select: { id: true, email: true, name: true },
      },
    },
  });
  if (!entry) {
    const err = new Error('Audit entry not found');
    err.status = 404;
    throw err;
  }
  return entry;
}

export async function exportAuditLog(orgId, { from, to, format }) {
  const rows = await prisma.auditEvent.findMany({
    where: {
      organizationId: orgId,
      ...(from && {
        createdAt: {
          gte: new Date(from),
          ...(to && { lte: new Date(to) }),
        },
      }),
      ...(!from && to && { createdAt: { lte: new Date(to) } }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { select: { email: true } },
    },
  });

  if (format === 'csv') {
    const header = 'id,action,targetType,targetId,actorEmail,ipAddress,createdAt';
    const dataRows = rows.map((r) =>
      [
        r.id,
        r.action,
        r.targetType ?? '',
        r.targetId ?? '',
        r.actor?.email ?? '',
        r.ipAddress ?? '',
        r.createdAt.toISOString(),
      ].join(','),
    );
    const csvString = [header, ...dataRows].join('\n');
    return { format, data: csvString };
  }

  return { format: 'json', data: rows };
}

export async function getAuditStats(orgId) {
  const [byTargetType, byActorUserId] = await Promise.all([
    prisma.auditEvent.groupBy({
      by: ['targetType'],
      where: { organizationId: orgId },
      _count: { id: true },
    }),
    prisma.auditEvent.groupBy({
      by: ['actorUserId'],
      where: { organizationId: orgId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  return { byTargetType, topActors: byActorUserId };
}
