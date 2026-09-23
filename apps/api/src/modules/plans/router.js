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

    const { error, value } = validators.createPlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const plan = await service.createPlan(organizationId, value);
    return res.status(201).json(success(plan));
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

    const { error, value } = validators.listPlansSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const plans = await service.listPlans(organizationId, value);
    return res.json(success(plans));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:planId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const plan = await service.getPlan(req.params.planId, organizationId);
    return res.json(success(plan));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.put('/:planId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.updatePlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const plan = await service.updatePlan(req.params.planId, organizationId, value);
    return res.json(success(plan));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.delete('/:planId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    await service.deletePlan(req.params.planId, organizationId);
    return res.json(success({ deleted: true }));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.post('/:planId/items', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.addPlanItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const item = await service.addPlanItem(req.params.planId, organizationId, value);
    return res.status(201).json(success(item));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.delete('/items/:itemId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    await service.removePlanItem(req.params.itemId, organizationId);
    return res.json(success({ deleted: true }));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
