import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireAuth);

router.post('/aggregate', async (req, res, next) => {
  try {
    const data = validators.aggregateUsageSchema.parse(req.body);
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({
        error: {code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required'},
      });
    }

    const aggregate = await service.aggregateUsage(organizationId, data);
    res.json({data: aggregate});
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.headers['x-organization-id'];

    if (!organizationId) {
      return res.status(400).json({
        error: {code: 'MISSING_ORGANIZATION', message: 'x-organization-id header is required'},
      });
    }

    const params = validators.queryAggregatesSchema.parse(req.query);
    const result = await service.listAggregates(organizationId, params);
    res.json({data: result});
  } catch (error) {
    next(error);
  }
});

export default router;
