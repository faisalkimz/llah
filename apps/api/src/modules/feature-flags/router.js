import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

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

router.put('/:key', async (req, res, next) => {
  try {
    const { key } = validators.flagKeySchema.parse(req.params);
    const data = validators.setFlagSchema.parse(req.body);
    const flag = await service.setFlag(key, data);
    res.json({ data: flag });
  } catch (error) {
    next(error);
  }
});

router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = validators.flagKeySchema.parse(req.params);
    await service.deleteFlag(key);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
