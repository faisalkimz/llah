import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// List job runs
router.get('/', async (req, res, next) => {
  try {
    const query = validators.listQuerySchema.parse(req.query);
    const data = await service.listJobRuns(req.organizationId, query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Get a single job run by id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.jobIdSchema.parse(req.params);
    const data = await service.getJobRun(req.organizationId, id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Trigger: process expired subscriptions
router.post('/subscriptions/process-expired', async (req, res, next) => {
  try {
    const data = await service.processExpiredSubscriptions(req.organizationId);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

// Trigger: close billing period for a subscription
router.post('/billing-periods/:subscriptionId/close', async (req, res, next) => {
  try {
    const { subscriptionId } = validators.subscriptionIdSchema.parse(req.params);
    const data = await service.runBillingPeriodClose(req.organizationId, subscriptionId);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

// Trigger: evaluate alerts
router.post('/alerts/evaluate', async (req, res, next) => {
  try {
    const data = await service.evaluateAlerts(req.organizationId);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

// Trigger: generate a report
router.post('/reports/:reportId/generate', async (req, res, next) => {
  try {
    const { reportId } = validators.reportIdParamSchema.parse(req.params);
    const data = await service.runReport(req.organizationId, reportId);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

// Generic job trigger
router.post('/run/:jobName', async (req, res, next) => {
  try {
    const { jobName } = validators.jobNameParamSchema.parse(req.params);
    const params = req.body ?? {};
    const orgId = req.organizationId;
    const data = await service.runJob(jobName, async () => params, orgId);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
