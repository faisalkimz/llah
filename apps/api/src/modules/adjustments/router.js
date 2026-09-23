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

    const { error, value } = validators.createAdjustmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const adjustment = await service.createAdjustment(organizationId, value);
    return res.status(201).json(success(adjustment));
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

    const { error, value } = validators.listAdjustmentsSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const adjustments = await service.listAdjustments(organizationId, value);
    return res.json(success(adjustments));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:adjustmentId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const adjustment = await service.getAdjustment(req.params.adjustmentId, organizationId);
    return res.json(success(adjustment));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
