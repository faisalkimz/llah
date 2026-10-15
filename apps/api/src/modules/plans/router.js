import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.post('/', async (req, res) => {
  try {
    const result = validators.createPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const plan = await service.createPlan(req.organizationId, result.data);
    return res.status(201).json({ data: plan });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = validators.listPlansSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const plans = await service.listPlans(req.organizationId, result.data);
    return res.json({ data: plans });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:planId', async (req, res) => {
  try {
    const plan = await service.getPlan(req.params.planId, req.organizationId);
    return res.json({ data: plan });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.put('/:planId', async (req, res) => {
  try {
    const result = validators.updatePlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const plan = await service.updatePlan(req.params.planId, req.organizationId, result.data);
    return res.json({ data: plan });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.delete('/:planId', async (req, res) => {
  try {
    await service.deletePlan(req.params.planId, req.organizationId);
    return res.json({ data: { deleted: true } });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/:planId/items', async (req, res) => {
  try {
    const result = validators.addPlanItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const item = await service.addPlanItem(req.params.planId, req.organizationId, result.data);
    return res.status(201).json({ data: item });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.delete('/items/:itemId', async (req, res) => {
  try {
    await service.removePlanItem(req.params.itemId, req.organizationId);
    return res.json({ data: { deleted: true } });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
