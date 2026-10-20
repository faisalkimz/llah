import prisma from '../../lib/prisma.js';

const VALID_TRANSITIONS = {
  OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export async function createTicket(orgId, data) {
  return prisma.supportTicket.create({
    data: {
      organizationId: orgId,
      subject: data.subject,
      description: data.description,
      priority: data.priority ?? 'NORMAL',
      ...(data.createdById ? { createdById: data.createdById } : {}),
    },
  });
}

export async function listTickets(orgId, opts = {}) {
  const { status, priority, limit = 20, offset = 0 } = opts;
  return prisma.supportTicket.findMany({
    where: {
      organizationId: orgId,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getTicket(orgId, id) {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!ticket) {
    const err = new Error('Support ticket not found');
    err.status = 404;
    throw err;
  }
  return ticket;
}

export async function updateTicket(orgId, id, data) {
  const current = await getTicket(orgId, id);

  if (data.status) {
    const allowed = VALID_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(data.status)) {
      const err = new Error(
        `Cannot transition ticket from ${current.status} to ${data.status}`
      );
      err.status = 422;
      throw err;
    }
  }

  return prisma.supportTicket.update({
    where: { id },
    data: {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.assignedToId !== undefined ? { assignedToId: data.assignedToId } : {}),
    },
  });
}

export async function deleteTicket(orgId, id) {
  await getTicket(orgId, id);
  await prisma.supportTicket.delete({ where: { id } });
}
