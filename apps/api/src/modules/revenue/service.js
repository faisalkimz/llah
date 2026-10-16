import prisma from '../../lib/prisma.js';

export async function getMRR(orgId) {
  const subs = await prisma.subscription.findMany({
    where: { organizationId: orgId, status: 'ACTIVE' },
    include: {
      plan: {
        include: {
          items: {
            include: { price: true },
          },
        },
      },
    },
  });

  let mrrMinor = BigInt(0);
  for (const sub of subs) {
    for (const item of sub.plan.items) {
      if (item.price.unitAmountMinor != null) {
        const qty = BigInt(item.quantity ?? 1);
        mrrMinor += BigInt(item.price.unitAmountMinor) * qty;
      }
    }
  }
  return mrrMinor;
}

export async function getARR(orgId) {
  const mrr = await getMRR(orgId);
  return mrr * BigInt(12);
}

export async function getRevenueByPeriod(orgId, { from, to, granularity }) {
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      status: 'PAID',
      paidAt: { gte: new Date(from), lte: new Date(to) },
    },
    select: { paidAt: true, amountPaidMinor: true },
  });

  const buckets = new Map();

  for (const inv of invoices) {
    const d = new Date(inv.paidAt);
    let key;
    if (granularity === 'day') {
      key = d.toISOString().slice(0, 10);
    } else if (granularity === 'week') {
      // ISO week: find the Monday of the week
      const day = d.getUTCDay(); // 0=Sun
      const diff = (day === 0 ? -6 : 1 - day);
      const monday = new Date(d);
      monday.setUTCDate(d.getUTCDate() + diff);
      key = monday.toISOString().slice(0, 10);
    } else {
      key = d.toISOString().slice(0, 7); // YYYY-MM
    }

    const current = buckets.get(key) ?? BigInt(0);
    buckets.set(key, current + BigInt(inv.amountPaidMinor));
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, revenueMinor]) => ({ period, revenueMinor }));
}

export async function getChurnRate(orgId, { from, to }) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Active at start: created before from, not canceled before from
  const activeAtStart = await prisma.subscription.count({
    where: {
      organizationId: orgId,
      createdAt: { lt: fromDate },
      OR: [
        { status: { not: 'CANCELED' } },
        { updatedAt: { gte: fromDate } },
      ],
    },
  });

  // Canceled in period
  const canceledCount = await prisma.subscription.count({
    where: {
      organizationId: orgId,
      status: 'CANCELED',
      updatedAt: { gte: fromDate, lte: toDate },
    },
  });

  const churnRatePercent =
    activeAtStart > 0 ? (canceledCount / activeAtStart) * 100 : 0;

  return { canceledCount, activeAtStartCount: activeAtStart, churnRatePercent };
}

export async function getRevenueStats(orgId) {
  const [mrrMinor, activeSubsCount, activeCustomersCount, paidInvoices] =
    await Promise.all([
      getMRR(orgId),
      prisma.subscription.count({
        where: { organizationId: orgId, status: 'ACTIVE' },
      }),
      prisma.customer.count({
        where: {
          organizationId: orgId,
          subscriptions: { some: { status: 'ACTIVE' } },
        },
      }),
      prisma.invoice.findMany({
        where: { organizationId: orgId, status: 'PAID' },
        select: { amountPaidMinor: true },
      }),
    ]);

  const totalRevenueMinor = paidInvoices.reduce(
    (sum, inv) => sum + BigInt(inv.amountPaidMinor),
    BigInt(0)
  );

  const arrMinor = mrrMinor * BigInt(12);

  return {
    mrrMinor,
    arrMinor,
    totalRevenueMinor,
    activeSubscriptions: activeSubsCount,
    activeCustomers: activeCustomersCount,
  };
}
