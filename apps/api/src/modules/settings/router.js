import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// List all settings for the org
router.get('/', async (req, res, next) => {
  try {
    const data = await service.listSettings(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Get a single setting by key
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = validators.keyParamSchema.parse(req.params);
    const value = await service.getSetting(req.organizationId, key);
    if (value === null) {
      const err = new Error('Setting not found');
      err.status = 404;
      throw err;
    }
    res.json({ data: { key, value } });
  } catch (error) {
    next(error);
  }
});

// Create or update a setting
router.put('/:key', async (req, res, next) => {
  try {
    const { key } = validators.keyParamSchema.parse(req.params);
    const { value } = validators.setValueSchema.parse(req.body);
    const data = await service.setSetting(req.organizationId, key, value);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Delete a setting
router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = validators.keyParamSchema.parse(req.params);
    await service.deleteSetting(req.organizationId, key);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
