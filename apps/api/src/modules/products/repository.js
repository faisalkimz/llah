import { prisma } from '../../lib/prisma.js';

export async function create(organizationId, data) {
  return prisma.product.create({
    data: { organizationId, ...data },
  });
}

export async function findById(productId, organizationId) {
  return prisma.product.findFirst({
    where: { id: productId, organizationId },
    include: {
      _count: { select: { prices: true } },
    },
  });
}

export async function findMany(organizationId, options = {}) {
  const {search, active, limit = 20, offset = 0} = options;
  const where = {organizationId};

  if (search) where.name = {contains: search, mode: 'insensitive'};
  if (active !== undefined) where.active = active === 'true';

  return prisma.product.findMany({
    where,
    include: {
      _count: {select: {prices: true}},
    },
    orderBy: {createdAt: 'desc'},
    take: limit,
    skip: offset,
  });
}

export async function count(organizationId, options = {}) {
  const {search, active} = options;
  const where = {organizationId};

  if (search) where.name = {contains: search, mode: 'insensitive'};
  if (active !== undefined) where.active = active === 'true';

  return prisma.product.count({where});
}

export async function update(productId, organizationId, data) {
  return prisma.product.update({
    where: {id: productId, organizationId},
    data,
  });
}

export async function deleteById(productId, organizationId) {
  return prisma.product.delete({
    where: {id: productId, organizationId},
  });
}
