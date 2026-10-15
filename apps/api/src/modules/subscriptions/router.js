import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();
router.use(requireOrg);

router.post('/', async (req, res) => {
  try {
    const result = validators.createSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const subscription = await service.createSubscription(req.organizationId, result.data);
    return res.status(201).json({ data: subscription });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = validators.listSubscriptionsSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const subscriptions = await service.listSubscriptions(req.organizationId, result.data);
    return res.json({ data: subscriptions });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:subscriptionId', async (req, res) => {
  try {
    const subscription = await service.getSubscription(req.params.subscriptionId, req.organizationId);
    return res.json({ data: subscription });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.put('/:subscriptionId', async (req, res) => {
  try {
    const result = validators.updateSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const subscription = await service.updateSubscription(req.params.subscriptionId, req.organizationId, result.data);
    return res.json({ data: subscription });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/:subscriptionId/cancel', async (req, res) => {
  try {
    const immediate = req.body.immediate === true;
    const subscription = await service.cancelSubscription(req.params.subscriptionId, req.organizationId, immediate);
    return res.json({ data: subscription });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
