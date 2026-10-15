import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireAuth);
router.use(requireOrg);

router.post('/aggregate', async (req, res, next) => {
  try {
    const data = validators.aggregateUsageSchema.parse(req.body);
    const aggregate = await service.aggregateUsage(req.organizationId, data);
    res.json({ data: aggregate });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.queryAggregatesSchema.parse(req.query);
    const result = await service.listAggregates(req.organizationId, params);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
