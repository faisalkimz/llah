import prisma from '../../lib/prisma.js';
import * as subscriptionsService from '../subscriptions/service.js';
import * as billingPeriodsService from '../billing-periods/service.js';
import * as alertsService from '../alerts/service.js';
import * as reportsService from '../reports/service.js';

/**
 * Wrap a function call in a JobRun record.
 * Creates a RUNNING record, calls fn(), then marks SUCCEEDED or FAILED.
 */
export async function runJob(jobName, fn, orgId) {
  const run = await prisma.jobRun.create({
    data: {
      jobName,
      status: 'RUNNING',
      startedAt: new Date(),
      ...(orgId ? { organizationId: orgId } : {}),
    },
  });

  try {
    const result = await fn();
    await prisma.jobRun.update({
      where: { id: run.id },
      data: {
        status: 'SUCCEEDED',
        finishedAt: new Date(),
        details: result !== undefined ? { result } : undefined,
      },
    });
    return result;
  } catch (err) {
    await prisma.jobRun.update({
      where: { id: run.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        details: { error: err.message },
      },
    });
    throw err;
  }
}

export async function processExpiredSubscriptions(orgId) {
  return runJob('processExpiredSubscriptions', () => subscriptionsService.processExpiredSubscriptions(), orgId);
}

export async function runBillingPeriodClose(orgId, subscriptionId) {
  return runJob('closeBillingPeriod', () => billingPeriodsService.closeBillingPeriod(orgId, subscriptionId), orgId);
}

export async function evaluateAlerts(orgId) {
  return runJob('evaluateAlerts', () => alertsService.evaluateAlerts(orgId), orgId);
}

export async function runReport(orgId, reportId) {
  const report = await prisma.report.findFirst({
    where: { id: reportId, organizationId: orgId },
  });
  if (!report) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }
  return runJob('generateReport', () => reportsService.generateReport(reportId, orgId, report.type), orgId);
}

export async function listJobRuns(orgId, opts = {}) {
  const { jobName, status, limit = 20, offset = 0 } = opts;
  return prisma.jobRun.findMany({
    where: {
      organizationId: orgId,
      ...(jobName ? { jobName } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getJobRun(orgId, id) {
  const run = await prisma.jobRun.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!run) {
    const err = new Error('Job run not found');
    err.status = 404;
    throw err;
  }
  return run;
}
