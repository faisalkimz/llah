import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.post('/', async (req, res) => {
  try {
    const result = validators.createAdjustmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const adjustment = await service.createAdjustment(req.organizationId, result.data);
    return res.status(201).json({ data: adjustment });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = validators.listAdjustmentsSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const adjustments = await service.listAdjustments(req.organizationId, result.data);
    return res.json({ data: adjustments });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:adjustmentId', async (req, res) => {
  try {
    const adjustment = await service.getAdjustment(req.params.adjustmentId, req.organizationId);
    return res.json({ data: adjustment });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
