import { Router } from 'express';
import { requireAdminAnywhere } from '../../middleware/rbac.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

// All admin routes require an ADMIN or OWNER membership in any org
router.use(requireAdminAnywhere);

// GET /admin/stats — system-wide aggregate counts
router.get('/stats', async (req, res, next) => {
  try {
    const data = await service.getSystemStats();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /admin/orgs — list all organizations
router.get('/orgs', async (req, res, next) => {
  try {
    const opts = validators.listQuerySchema.parse(req.query);
    const data = await service.listAllOrgs(opts);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /admin/users — list all users
router.get('/users', async (req, res, next) => {
  try {
    const opts = validators.listQuerySchema.parse(req.query);
    const data = await service.listAllUsers(opts);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /admin/orgs/:orgId — detailed org overview
router.get('/orgs/:orgId', async (req, res, next) => {
  try {
    const { orgId } = validators.orgIdSchema.parse(req.params);
    const data = await service.getOrgOverview(orgId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /admin/health — system health check
router.get('/health', async (req, res, next) => {
  try {
    const data = await service.getSystemHealth();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
