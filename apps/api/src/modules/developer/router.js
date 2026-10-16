import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

router.get('/overview', async (req, res, next) => {
  try {
    const data = await service.getDeveloperOverview(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/api-stats', async (req, res, next) => {
  try {
    const query = validators.apiStatsQuerySchema.parse(req.query);
    const data = await service.getApiStats(req.organizationId, query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/webhook-stats', async (req, res, next) => {
  try {
    const data = await service.getWebhookStats(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
