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

    const { error, value } = validators.createRefundSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const refund = await service.createRefund(organizationId, value);
    return res.status(201).json(success(refund));
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

    const { error, value } = validators.listRefundsSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const refunds = await service.listRefunds(organizationId, value);
    return res.json(success(refunds));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:refundId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const refund = await service.getRefund(req.params.refundId, organizationId);
    return res.json(success(refund));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
