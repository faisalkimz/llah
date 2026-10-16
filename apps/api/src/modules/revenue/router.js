import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

router.get('/mrr', async (req, res, next) => {
  try {
    const mrrMinor = await service.getMRR(req.organizationId);
    res.json({ data: { mrrMinor } });
  } catch (error) {
    next(error);
  }
});

router.get('/arr', async (req, res, next) => {
  try {
    const arrMinor = await service.getARR(req.organizationId);
    res.json({ data: { arrMinor } });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const data = await service.getRevenueStats(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/by-period', async (req, res, next) => {
  try {
    const query = validators.periodQuerySchema.parse(req.query);
    const data = await service.getRevenueByPeriod(req.organizationId, query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/churn', async (req, res, next) => {
  try {
    const query = validators.churnQuerySchema.parse(req.query);
    const data = await service.getChurnRate(req.organizationId, query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
