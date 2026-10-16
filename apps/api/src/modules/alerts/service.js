import prisma from '../../lib/prisma.js';
import * as revenueService from '../revenue/service.js';

export async function createAlertRule(orgId, data) {
  return prisma.alertRule.create({
    data: {
      organizationId: orgId,
      name: data.name,
      metric: data.metric,
      threshold: data.threshold,
      operator: data.operator ?? 'GT',
      active: data.active ?? true,
    },
  });
}

export async function listAlertRules(orgId) {
  return prisma.alertRule.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAlertRule(id, orgId) {
  const rule = await prisma.alertRule.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!rule) {
    const err = new Error('Alert rule not found');
    err.status = 404;
    throw err;
  }
  return rule;
}

export async function updateAlertRule(id, orgId, data) {
  await getAlertRule(id, orgId);
  return prisma.alertRule.update({
    where: { id },
    data,
  });
}

export async function deleteAlertRule(id, orgId) {
  await getAlertRule(id, orgId);
  await prisma.alertRule.delete({ where: { id } });
}

function compareValue(value, threshold, operator) {
  const v = Number(value);
  const t = Number(threshold);
  switch (operator) {
    case 'GT':  return v > t;
    case 'GTE': return v >= t;
    case 'LT':  return v < t;
    case 'LTE': return v <= t;
    default:    return false;
  }
}

export async function evaluateAlerts(orgId) {
  const rules = await prisma.alertRule.findMany({
    where: { organizationId: orgId, active: true },
  });

  let evaluated = 0;
  let fired = 0;

  for (const rule of rules) {
    evaluated++;
    let currentValue = 0;

    try {
      switch (rule.metric) {
        case 'USAGE_AMOUNT': {
          const agg = await prisma.usageAggregate.aggregate({
            where: { organizationId: orgId },
            _sum: { quantity: true },
          });
          currentValue = Number(agg._sum.quantity ?? 0);
          break;
        }

        case 'INVOICE_OVERDUE_DAYS': {
          const now = new Date();
          const oldest = await prisma.invoice.findFirst({
            where: {
              organizationId: orgId,
              status: 'OPEN',
              dueAt: { lt: now },
            },
            orderBy: { dueAt: 'asc' },
            select: { dueAt: true },
          });
          if (oldest?.dueAt) {
            currentValue = Math.floor(
              (now.getTime() - oldest.dueAt.getTime()) / (1000 * 60 * 60 * 24)
            );
          }
          break;
        }

        case 'PAYMENT_FAILURE_COUNT': {
          const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          currentValue = await prisma.payment.count({
            where: {
              organizationId: orgId,
              status: 'FAILED',
              createdAt: { gte: since },
            },
          });
          break;
        }

        case 'MRR_DROP_PERCENT': {
          const currentMrr = await revenueService.getMRR(orgId);
          // approximate prior MRR: add canceled subs from last 30 days
          const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const canceledRecently = await prisma.subscription.findMany({
            where: {
              organizationId: orgId,
              status: 'CANCELED',
              updatedAt: { gte: since },
            },
            include: {
              plan: {
                include: {
                  items: { include: { price: true } },
                },
              },
            },
          });
          let canceledMrrMinor = BigInt(0);
          for (const sub of canceledRecently) {
            for (const item of sub.plan.items) {
              if (item.price.unitAmountMinor != null) {
                const qty = BigInt(item.quantity ?? 1);
                canceledMrrMinor += BigInt(item.price.unitAmountMinor) * qty;
              }
            }
          }
          const priorMrr = currentMrr + canceledMrrMinor;
          if (priorMrr > BigInt(0)) {
            currentValue = Number((canceledMrrMinor * BigInt(100)) / priorMrr);
          }
          break;
        }

        default:
          break;
      }

      if (compareValue(currentValue, rule.threshold, rule.operator)) {
        // Check if there's already an unresolved firing
        const existing = await prisma.alertFiring.findFirst({
          where: { alertRuleId: rule.id, resolvedAt: null },
        });
        if (!existing) {
          await prisma.alertFiring.create({
            data: { alertRuleId: rule.id, value: currentValue },
          });
          fired++;
        }
      }
    } catch {
      // Skip this rule if evaluation fails; don't abort the whole batch
    }
  }

  return { evaluated, fired };
}

export async function listFirings(orgId, filters = {}) {
  const where = {
    alertRule: { organizationId: orgId },
  };
  if (filters.resolved === 'true') {
    where.resolvedAt = { not: null };
  } else if (filters.resolved === 'false') {
    where.resolvedAt = null;
  }
  return prisma.alertFiring.findMany({
    where,
    include: { alertRule: true },
    orderBy: { firedAt: 'desc' },
  });
}

export async function resolveFiring(firingId, orgId) {
  const firing = await prisma.alertFiring.findFirst({
    where: {
      id: firingId,
      alertRule: { organizationId: orgId },
    },
  });
  if (!firing) {
    const err = new Error('Alert firing not found');
    err.status = 404;
    throw err;
  }
  return prisma.alertFiring.update({
    where: { id: firingId },
    data: { resolvedAt: new Date() },
  });
}
