import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireAuth);
router.use(requireOrg);

router.post('/', async (req, res, next) => {
  try {
    const data = validators.createMeterSchema.parse(req.body);
    const meter = await service.createMeter(req.organizationId, data);
    res.status(201).json({ data: meter });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const params = validators.listMetersQuerySchema.parse(req.query);
    const result = await service.listMeters(req.organizationId, params);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.meterIdSchema.parse(req.params);
    const meter = await service.getMeterWithStats(id, req.organizationId);
    res.json({ data: meter });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.meterIdSchema.parse(req.params);
    const data = validators.updateMeterSchema.parse(req.body);
    const meter = await service.updateMeter(id, req.organizationId, data);
    res.json({ data: meter });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.meterIdSchema.parse(req.params);
    await service.deleteMeter(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
