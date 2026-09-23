import prisma from '../../lib/prisma.js';

export async function createPlan(data) {
  const { items, ...planData } = data;
  return await prisma.plan.create({
    data: {
      ...planData,
      items: {
        create: items.map((item, index) => ({
          priceId: item.priceId,
          sortOrder: item.sortOrder ?? index
        }))
      }
    },
    include: {
      items: {
        include: {
          price: true
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
}

export async function findPlansByOrganization(organizationId, filters = {}) {
  const { active, limit = 20, offset = 0 } = filters;
  const where = { organizationId };
  if (active !== undefined) where.active = active;

  return await prisma.plan.findMany({
    where,
    include: {
      items: {
        include: {
          price: true
        },
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

export async function findPlanById(planId, organizationId) {
  return await prisma.plan.findFirst({
    where: { id: planId, organizationId },
    include: {
      items: {
        include: {
          price: true
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
}

export async function updatePlan(planId, organizationId, data) {
  return await prisma.plan.update({
    where: { id: planId, organizationId },
    data,
    include: {
      items: {
        include: {
          price: true
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
}

export async function deletePlan(planId, organizationId) {
  return await prisma.plan.delete({
    where: { id: planId, organizationId }
  });
}

export async function addPlanItem(planId, organizationId, itemData) {
  const plan = await findPlanById(planId, organizationId);
  if (!plan) return null;

  return await prisma.planItem.create({
    data: {
      planId,
      priceId: itemData.priceId,
      sortOrder: itemData.sortOrder ?? 0
    },
    include: {
      price: true
    }
  });
}

export async function removePlanItem(itemId, organizationId) {
  const item = await prisma.planItem.findFirst({
    where: {
      id: itemId,
      plan: { organizationId }
    }
  });
  if (!item) return null;

  return await prisma.planItem.delete({
    where: { id: itemId }
  });
}
