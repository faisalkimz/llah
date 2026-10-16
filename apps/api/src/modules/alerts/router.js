import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// Static routes before /:id to prevent Express matching them as id params
router.post('/evaluate', async (req, res, next) => {
  try {
    const data = await service.evaluateAlerts(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/firings', async (req, res, next) => {
  try {
    const data = await service.listFirings(req.organizationId, req.query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/firings/:id/resolve', async (req, res, next) => {
  try {
    const { id } = validators.firingIdSchema.parse(req.params);
    const data = await service.resolveFiring(id, req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const data = await service.listAlertRules(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = validators.createAlertRuleSchema.parse(req.body);
    const data = await service.createAlertRule(req.organizationId, body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.alertRuleIdSchema.parse(req.params);
    const data = await service.getAlertRule(id, req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.alertRuleIdSchema.parse(req.params);
    const body = validators.updateAlertRuleSchema.parse(req.body);
    const data = await service.updateAlertRule(id, req.organizationId, body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.alertRuleIdSchema.parse(req.params);
    await service.deleteAlertRule(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
