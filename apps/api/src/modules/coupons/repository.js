import prisma from '../../lib/prisma.js';

export async function createCoupon(data) {
  return await prisma.coupon.create({ data });
}

export async function findCouponByCode(orgId, code) {
  // Case-insensitive lookup — codes are stored uppercase, so normalise incoming code
  return await prisma.coupon.findUnique({
    where: { orgId_code: { orgId, code: code.toUpperCase() } },
  });
}

export async function findCouponById(orgId, id) {
  return await prisma.coupon.findFirst({
    where: { id, orgId },
  });
}

export async function findCouponsByOrg(orgId) {
  return await prisma.coupon.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function incrementRedemptionCount(id) {
  return await prisma.coupon.update({
    where: { id },
    data: { redemptionCount: { increment: 1 } },
  });
}

export async function deactivateCoupon(orgId, id) {
  return await prisma.coupon.updateMany({
    where: { id, orgId },
    data: { active: false },
  });
}
