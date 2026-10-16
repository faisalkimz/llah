import prisma from '../../lib/prisma.js';
import * as revenueService from '../revenue/service.js';

async function generateReport(reportId, orgId, reportType) {
  await prisma.report.update({
    where: { id: reportId },
    data: { status: 'PROCESSING' },
  });

  try {
    let result;

    switch (reportType) {
      case 'INVOICE_SUMMARY': {
        const invoices = await prisma.invoice.findMany({
          where: { organizationId: orgId },
          select: { status: true, totalMinor: true },
        });
        const byStatus = {};
        let sumTotal = BigInt(0);
        for (const inv of invoices) {
          byStatus[inv.status] = (byStatus[inv.status] ?? 0) + 1;
          sumTotal += BigInt(inv.totalMinor);
        }
        result = { byStatus, totalCount: invoices.length, sumTotalMinor: sumTotal.toString() };
        break;
      }

      case 'REVENUE_SUMMARY': {
        const stats = await revenueService.getRevenueStats(orgId);
        result = {
          mrrMinor: stats.mrrMinor.toString(),
          arrMinor: stats.arrMinor.toString(),
          totalRevenueMinor: stats.totalRevenueMinor.toString(),
          activeSubscriptions: stats.activeSubscriptions,
          activeCustomers: stats.activeCustomers,
        };
        break;
      }

      case 'SUBSCRIPTION_SUMMARY': {
        const subs = await prisma.subscription.findMany({
          where: { organizationId: orgId },
          select: { status: true },
        });
        const byStatus = {};
        for (const sub of subs) {
          byStatus[sub.status] = (byStatus[sub.status] ?? 0) + 1;
        }
        result = { byStatus, totalCount: subs.length };
        break;
      }

      case 'USAGE_SUMMARY': {
        const aggregates = await prisma.usageAggregate.groupBy({
          by: ['meterId'],
          where: { organizationId: orgId },
          _sum: { quantity: true },
        });
        result = {
          byMeter: aggregates.map((a) => ({
            meterId: a.meterId,
            totalQuantity: a._sum.quantity?.toString() ?? '0',
          })),
        };
        break;
      }

      case 'TAX_SUMMARY': {
        const invoices = await prisma.invoice.findMany({
          where: { organizationId: orgId, status: 'PAID' },
          select: { taxMinor: true },
        });
        const totalTaxMinor = invoices.reduce(
          (sum, inv) => sum + BigInt(inv.taxMinor),
          BigInt(0)
        );
        result = { totalTaxMinor: totalTaxMinor.toString(), paidInvoiceCount: invoices.length };
        break;
      }

      default: {
        const err = new Error(`Unknown report type: ${reportType}`);
        err.status = 422;
        throw err;
      }
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'COMPLETED',
        result,
        generatedAt: new Date(),
      },
    });

    return updated;
  } catch (err) {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'FAILED' },
    });
    throw err;
  }
}

export async function createReport(orgId, data) {
  const report = await prisma.report.create({
    data: {
      organizationId: orgId,
      type: data.type,
      parameters: data.parameters ?? null,
      status: 'PENDING',
    },
  });

  return await generateReport(report.id, orgId, report.type);
}

export async function listReports(orgId) {
  return prisma.report.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReport(id, orgId) {
  const report = await prisma.report.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!report) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }
  return report;
}

export async function deleteReport(id, orgId) {
  await getReport(id, orgId);
  await prisma.report.delete({ where: { id } });
}
