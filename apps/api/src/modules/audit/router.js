import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import { requireMinRole } from '../../middleware/rbac.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);
router.use(requireMinRole('ADMIN'));

// Static paths before /:id
router.get('/export', async (req, res, next) => {
  try {
    const params = validators.exportQuerySchema.parse(req.query);
    const result = await service.exportAuditLog(req.organizationId, params);
    if (result.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.send(result.data);
    } else {
      res.json({ data: result.data });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await service.getAuditStats(req.organizationId);
    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.listAuditQuerySchema.parse(req.query);
    const entries = await service.listAuditLog(req.organizationId, params);
    res.json({ data: entries });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.auditIdSchema.parse(req.params);
    const entry = await service.getAuditEntry(id, req.organizationId);
    res.json({ data: entry });
  } catch (error) {
    next(error);
  }
});

export default router;
