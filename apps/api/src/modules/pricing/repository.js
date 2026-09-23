import { prisma } from '../../lib/prisma.js';

export async function create(organizationId, data) {
  return prisma.price.create({
    data: {organizationId, ...data},
    include: {
      product: {select: {id: true, name: true}},
      meter: {select: {id: true, key: true, name: true, unit: true}},
    },
  });
}

export async function findById(priceId, organizationId) {
  return prisma.price.findFirst({
    where: {id: priceId, organizationId},
    include: {
      product: {select: {id: true, name: true}},
      meter: {select: {id: true, key: true, name: true, unit: true}},
    },
  });
}

export async function findMany(organizationId, options = {}) {
  const {productId, meterId, active, limit = 20, offset = 0} = options;
  const where = {organizationId};

  if (productId) where.productId = productId;
  if (meterId) where.meterId = meterId;
  if (active !== undefined) where.active = active === 'true';

  return prisma.price.findMany({
    where,
    include: {
      product: {select: {id: true, name: true}},
      meter: {select: {id: true, key: true, name: true}},
    },
    orderBy: {createdAt: 'desc'},
    take: limit,
    skip: offset,
  });
}

export async function count(organizationId, options = {}) {
  const {productId, meterId, active} = options;
  const where = {organizationId};

  if (productId) where.productId = productId;
  if (meterId) where.meterId = meterId;
  if (active !== undefined) where.active = active === 'true';

  return prisma.price.count({where});
}

export async function update(priceId, organizationId, data) {
  return prisma.price.update({
    where: {id: priceId, organizationId},
    data,
  });
}

export async function deleteById(priceId, organizationId) {
  return prisma.price.delete({
    where: {id: priceId, organizationId},
  });
}
