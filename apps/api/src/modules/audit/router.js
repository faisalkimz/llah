import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// Admin guard: requires ADMIN or OWNER role
router.use(async (req, res, next) => {
  try {
    const { findByUserAndOrg } = await import('../organizations/membership-repository.js');
    const m = await findByUserAndOrg(req.user.id, req.organizationId);
    if (!m) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not a member' } });
    }
    const rank = { OWNER: 5, ADMIN: 4, BILLING: 3, DEVELOPER: 2, ANALYST: 1, VIEWER: 0 };
    if ((rank[m.role] ?? -1) < 4) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin required' } });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Static paths before /:id
router.get('/export', async (req, res, next) => {
  try {
    const params = validators.exportQuerySchema.parse(req.query);
    const result = await service.exportAuditLog(req.organizationId, params);
    res.setHeader(
      'Content-Type',
      result.format === 'csv' ? 'text/csv' : 'application/json',
    );
    res.send(result.data);
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
