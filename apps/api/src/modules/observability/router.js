import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';

const router = Router();

// All routes under this router require an org context
router.use(requireOrg);

// GET /observability/metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const data = await service.getMetrics(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /observability/uptime
router.get('/uptime', async (req, res, next) => {
  try {
    const data = service.getUptime();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
