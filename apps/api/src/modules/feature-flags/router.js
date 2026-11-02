import { Router } from 'express';
import { requireAdminAnywhere } from '../../middleware/rbac.js';
import * as service from './service.js';
import * as validators from './validators.js';

// Feature flags are platform-wide — no organizationId column on FeatureFlag.
// Any authenticated user can READ flags (applied in routes.js via requireAuth).
// Only platform super-admins (requireAdminAnywhere) can CREATE, UPDATE, or DELETE flags.
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const flags = await service.listFlags();
    res.json({ data: flags });
  } catch (error) {
    next(error);
  }
});

router.get('/:key', async (req, res, next) => {
  try {
    const { key } = validators.flagKeySchema.parse(req.params);
    const flag = await service.getFlag(key);
    res.json({ data: flag ?? { key, enabled: false } });
  } catch (error) {
    next(error);
  }
});

router.put('/:key', requireAdminAnywhere, async (req, res, next) => {
  try {
    const { key } = validators.flagKeySchema.parse(req.params);
    const data = validators.setFlagSchema.parse(req.body);
    const flag = await service.setFlag(key, data);
    res.json({ data: flag });
  } catch (error) {
    next(error);
  }
});

router.delete('/:key', requireAdminAnywhere, async (req, res, next) => {
  try {
    const { key } = validators.flagKeySchema.parse(req.params);
    await service.deleteFlag(key);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
