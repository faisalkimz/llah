import { Router } from 'express';
import * as service from './service.js';
import * as validators from './validators.js';
import { success, error as errorResponse } from '../../lib/api-response.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.createSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const subscription = await service.createSubscription(organizationId, value);
    return res.status(201).json(success(subscription));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.get('/', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.listSubscriptionsSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const subscriptions = await service.listSubscriptions(organizationId, value);
    return res.json(success(subscriptions));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:subscriptionId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const subscription = await service.getSubscription(req.params.subscriptionId, organizationId);
    return res.json(success(subscription));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.put('/:subscriptionId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.updateSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const subscription = await service.updateSubscription(req.params.subscriptionId, organizationId, value);
    return res.json(success(subscription));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.post('/:subscriptionId/cancel', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const immediate = req.body.immediate === true;
    const subscription = await service.cancelSubscription(req.params.subscriptionId, organizationId, immediate);
    return res.json(success(subscription));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
